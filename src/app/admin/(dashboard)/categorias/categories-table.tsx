"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import type { Category } from "@/lib/types/database";
import { deleteCategory, reorderCategories } from "./actions";
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal";
import { EditCategoryModal } from "./edit-category-modal";
import { useToast } from "@/components/ui/toast";

function SortableCategoryRow({
  category,
  onEdit,
  onDelete,
  canDelete,
  deleting,
}: {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
  deleting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-slate-50 ${isDragging ? "bg-white shadow-lg" : ""}`}
    >
      <td className="px-4 py-3">
        <span
          {...attributes}
          {...listeners}
          className="flex cursor-grab touch-none items-center gap-1 text-slate-500 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
          {category.order_index}
        </span>
      </td>
      <td className="px-4 py-3 font-medium text-slate-900">{category.name}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex cursor-pointer justify-end gap-2">
          <button
            onClick={onEdit}
            className="cursor-pointer rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </button>
          {canDelete && (
            <button
              onClick={onDelete}
              disabled={deleting}
              className="cursor-pointer rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export function CategoriesTable({ categories }: { categories: Category[] }) {
  const [items, setItems] = useState(categories);
  const [editing, setEditing] = useState<Category | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setItems(categories);
  }, [categories]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((c) => c.id === active.id);
    const newIndex = items.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    setReordering(true);
    const updates = newItems.map((c, i) => ({
      id: c.id,
      order_index: i + 1,
    }));
    await reorderCategories(updates);
    setReordering(false);
  }

  async function handleConfirmDelete() {
    if (!itemToDelete) return;
    setDeleting(true);
    const { ok, error } = await deleteCategory(itemToDelete.id);
    setDeleting(false);
    setItemToDelete(null);
    if (ok) {
      setItems((prev) => prev.filter((c) => c.id !== itemToDelete.id));
      toast.success("Categoría eliminada", "Los productos se movieron a General.");
    } else {
      toast.error("Error al eliminar", error ?? "No se pudo eliminar la categoría.");
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-10 px-4 py-3 text-left text-xs font-medium text-slate-500">
                  Orden {reordering && "(guardando...)"}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Nombre</th>
                <th className="w-32 px-4 py-3 text-right text-xs font-medium text-slate-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              <SortableContext
                items={items.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((c) => (
                  <SortableCategoryRow
                    key={c.id}
                    category={c}
                    onEdit={() => setEditing(c)}
                    onDelete={() => setItemToDelete({ id: c.id, name: c.name })}
                    canDelete={c.id !== "00000000-0000-0000-0000-000000000001"}
                    deleting={deleting && itemToDelete?.id === c.id}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </div>
      </DndContext>

      {editing && (
        <EditCategoryModal
          category={editing}
          onClose={() => setEditing(null)}
          onSuccess={() => toast.success("Categoría actualizada", "Los cambios se guardaron correctamente.")}
        />
      )}

      {itemToDelete && (
        <DeleteConfirmModal
          title="Eliminar categoría"
          message={`¿Eliminar la categoría "${itemToDelete.name}"? Los productos se moverán a "General".`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setItemToDelete(null)}
          loading={deleting}
        />
      )}
    </>
  );
}
