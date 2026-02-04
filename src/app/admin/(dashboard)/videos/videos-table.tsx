"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { Pencil, Trash2, GripVertical, Video } from "lucide-react";
import type { Video as VideoType } from "@/lib/types/database";
import { deleteVideo, reorderVideos } from "./actions";
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal";
import { useToast } from "@/components/ui/toast";

function SortableVideoRow({
  video,
  onDelete,
  deleting,
}: {
  video: VideoType;
  onDelete: () => void;
  deleting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id });

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
          {video.order_index}
        </span>
      </td>
      <td className="px-4 py-3 font-medium text-slate-900">{video.name}</td>
      <td className="px-4 py-3">
        <a
          href={video.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700"
        >
          <Video className="h-4 w-4" />
          Ver video
        </a>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex cursor-pointer justify-end gap-2">
          <Link
            href={`/admin/videos/${video.id}/edit`}
            className="cursor-pointer rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="cursor-pointer rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function VideosTable({ videos }: { videos: VideoType[] }) {
  const [items, setItems] = useState(videos);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setItems(videos);
  }, [videos]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((v) => v.id === active.id);
    const newIndex = items.findIndex((v) => v.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    setReordering(true);
    const updates = newItems.map((v, i) => ({ id: v.id, order_index: i + 1 }));
    const { ok, error } = await reorderVideos(updates);
    setReordering(false);

    if (ok) {
      toast.success("Orden actualizado", "Los videos se reordenaron correctamente.");
    } else {
      toast.error("Error al reordenar", error ?? "No se pudo guardar el orden.");
    }
  }

  async function handleConfirmDelete() {
    if (!itemToDelete) return;
    setDeleting(true);
    const { ok, error } = await deleteVideo(itemToDelete.id);
    setDeleting(false);
    setItemToDelete(null);
    if (ok) {
      setItems((prev) => prev.filter((v) => v.id !== itemToDelete.id));
      toast.success("Video eliminado", "El video se eliminó correctamente.");
    } else {
      toast.error("Error al eliminar", error ?? "No se pudo eliminar el video.");
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
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Archivo</th>
                <th className="w-32 px-4 py-3 text-right text-xs font-medium text-slate-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                    No hay videos. Sube el primero desde &quot;Nuevo video&quot;.
                  </td>
                </tr>
              ) : (
                <SortableContext
                  items={items.map((v) => v.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {items.map((v) => (
                    <SortableVideoRow
                      key={v.id}
                      video={v}
                      onDelete={() => setItemToDelete({ id: v.id, name: v.name })}
                      deleting={deleting && itemToDelete?.id === v.id}
                    />
                  ))}
                </SortableContext>
              )}
            </tbody>
          </table>
        </div>
      </DndContext>

      {itemToDelete && (
        <DeleteConfirmModal
          title="Eliminar video"
          message={`¿Eliminar el video "${itemToDelete.name}"? El archivo también se borrará del almacenamiento.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setItemToDelete(null)}
          loading={deleting}
        />
      )}
    </>
  );
}
