"use client";

import { useState, useEffect } from "react";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}
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
import { deleteProduct, reorderProducts } from "./actions";
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal";
import { EditProductModal } from "./edit-product-modal";
import { useToast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/validations/product";

type ProductRow = {
  id: string;
  codigo: string;
  name: string;
  price: number;
  order_index: number;
  category_id: string;
};

type Category = { id: string; name: string; order_index: number };

function SortableProductRow({
  product,
  onEdit,
  onDelete,
  deleting,
}: {
  product: ProductRow;
  onEdit: () => void;
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
  } = useSortable({ id: product.id });

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
          {product.order_index}
        </span>
      </td>
      <td className="px-4 py-3 font-mono text-sm text-slate-600">{product.codigo}</td>
      <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
      <td className="px-4 py-3 text-right font-medium text-slate-900">
        ${formatPrice(product.price)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex cursor-pointer justify-end gap-2">
          <button
            onClick={onEdit}
            className="cursor-pointer rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </button>
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

function ProductCard({
  product,
  categoryName,
  showOrder,
  showCategory,
  orderIndex,
  onEdit,
  onDelete,
  deleting,
  dragHandle,
}: {
  product: ProductRow;
  categoryName: string;
  showOrder: boolean;
  showCategory: boolean;
  orderIndex?: number;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
  dragHandle?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {dragHandle && (
        <div className="flex items-center justify-center border-b border-slate-100 p-1.5">
          {dragHandle}
        </div>
      )}
      <div className="p-3">
        {/* Fila 1: Orden · Código · Precio */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {showOrder && orderIndex != null && (
            <span className="text-slate-500">
              Orden <span className="font-semibold text-slate-900">{orderIndex}</span>
            </span>
          )}
          <span className="text-slate-500">
            Código <span className="font-mono font-semibold text-slate-900">{product.codigo}</span>
          </span>
          <span className="text-slate-500">
            Precio <span className="font-semibold text-slate-900">${formatPrice(product.price)}</span>
          </span>
        </div>
        {/* Fila 2: Nombre */}
        <p className="mt-2 line-clamp-2 font-medium text-slate-900">{product.name}</p>
        {/* Fila 3: Categoría (si aplica) */}
        {showCategory && (
          <p className="mt-1 text-xs text-slate-500">Categoría: {categoryName}</p>
        )}
        {/* Botones */}
        <div className="mt-3 flex cursor-pointer gap-2">
          <button
            onClick={onEdit}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-amber-400"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function SortableProductCard({
  product,
  categoryName,
  showOrder,
  showCategory,
  orderIndex,
  onEdit,
  onDelete,
  deleting,
}: {
  product: ProductRow;
  categoryName: string;
  showOrder: boolean;
  showCategory: boolean;
  orderIndex?: number;
  onEdit: () => void;
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
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragHandle = (
    <span
      {...attributes}
      {...listeners}
      className="flex cursor-grab touch-none items-center justify-center gap-1.5 rounded-lg py-1.5 text-slate-500 active:cursor-grabbing active:bg-slate-50"
    >
      <GripVertical className="h-4 w-4" />
      <span className="text-xs">Arrastrar para ordenar</span>
    </span>
  );

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-80" : ""}>
      <ProductCard
        product={product}
        categoryName={categoryName}
        showOrder={showOrder}
        showCategory={showCategory}
        orderIndex={orderIndex}
        onEdit={onEdit}
        onDelete={onDelete}
        deleting={deleting}
        dragHandle={dragHandle}
      />
    </div>
  );
}

function ProductRowPlain({
  product,
  categoryName,
  onEdit,
  onDelete,
  deleting,
}: {
  product: ProductRow;
  categoryName: string;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3 font-mono text-sm text-slate-600">{product.codigo}</td>
      <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
      <td className="px-4 py-3 text-slate-600">{categoryName}</td>
      <td className="px-4 py-3 text-right font-medium text-slate-900">
        ${formatPrice(product.price)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex cursor-pointer justify-end gap-2">
          <button
            onClick={onEdit}
            className="cursor-pointer rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </button>
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

export function ProductsTable({
  products,
  categories,
  selectedCategoryId,
}: {
  products: ProductRow[];
  categories: Category[];
  selectedCategoryId: string | "all";
}) {
  const [items, setItems] = useState(products);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);
  const toast = useToast();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    setItems(products);
  }, [products]);

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name ?? "—";

  const getCategoryOrder = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.order_index ?? 999;

  const sortedForAll = [...items].sort((a, b) => {
    const orderA = getCategoryOrder(a.category_id);
    const orderB = getCategoryOrder(b.category_id);
    if (orderA !== orderB) return orderA - orderB;
    return a.order_index - b.order_index || a.name.localeCompare(b.name);
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleDragEnd(event: DragEndEvent) {
    if (selectedCategoryId === "all") return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((p) => p.id === active.id);
    const newIndex = items.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    setReordering(true);
    const updates = newItems.map((p, i) => ({
      id: p.id,
      order_index: i + 1,
    }));
    await reorderProducts(selectedCategoryId, updates);
    setReordering(false);
  }

  async function handleConfirmDelete() {
    if (!itemToDelete) return;
    setDeleting(true);
    const { ok, error } = await deleteProduct(itemToDelete.id);
    setDeleting(false);
    setItemToDelete(null);
    if (ok) {
      setItems((prev) => prev.filter((p) => p.id !== itemToDelete.id));
      toast.success("Producto eliminado", "El producto se eliminó correctamente.");
    } else {
      toast.error("Error al eliminar", error ?? "No se pudo eliminar el producto.");
    }
  }

  const showOrder = selectedCategoryId !== "all";
  const displayProducts = showOrder
    ? [...items].sort((a, b) => a.order_index - b.order_index || a.name.localeCompare(b.name))
    : sortedForAll;

  const emptyMessage = showOrder
    ? "No hay productos en esta categoría."
    : "No hay productos. Crea uno o cambia de categoría.";

  return (
    <>
      {/* Vista móvil: cards */}
      {!isDesktop && (
        <div className="space-y-3">
          {displayProducts.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-12 text-center text-slate-500">
              {emptyMessage}
            </div>
          ) : showOrder ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={displayProducts.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {displayProducts.map((p) => (
                    <SortableProductCard
                      key={p.id}
                      product={p}
                      categoryName={getCategoryName(p.category_id)}
                      showOrder={showOrder}
                      showCategory={!showOrder}
                      orderIndex={p.order_index}
                      onEdit={() => setEditing(p)}
                      onDelete={() => setItemToDelete({ id: p.id, name: p.name })}
                      deleting={deleting && itemToDelete?.id === p.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            displayProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                categoryName={getCategoryName(p.category_id)}
                showOrder={false}
                showCategory={true}
                onEdit={() => setEditing(p)}
                onDelete={() => setItemToDelete({ id: p.id, name: p.name })}
                deleting={deleting && itemToDelete?.id === p.id}
              />
            ))
          )}
        </div>
      )}

      {/* Vista escritorio: tabla */}
      {isDesktop && (
      showOrder ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="w-10 px-4 py-3 text-left text-xs font-medium text-slate-500">
                      Orden {reordering && "(guardando...)"}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Nombre</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Precio</th>
                    <th className="w-32 px-4 py-3 text-right text-xs font-medium text-slate-500">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {displayProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                        {emptyMessage}
                      </td>
                    </tr>
                  ) : (
                    <SortableContext
                      items={displayProducts.map((p) => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {displayProducts.map((p) => (
                        <SortableProductRow
                          key={p.id}
                          product={p}
                          onEdit={() => setEditing(p)}
                          onDelete={() => setItemToDelete({ id: p.id, name: p.name })}
                          deleting={deleting && itemToDelete?.id === p.id}
                        />
                      ))}
                    </SortableContext>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </DndContext>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Categoría</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Precio</th>
                  <th className="w-32 px-4 py-3 text-right text-xs font-medium text-slate-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {displayProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  displayProducts.map((p) => (
                    <ProductRowPlain
                      key={p.id}
                      product={p}
                      categoryName={getCategoryName(p.category_id)}
                      onEdit={() => setEditing(p)}
                      onDelete={() => setItemToDelete({ id: p.id, name: p.name })}
                      deleting={deleting && itemToDelete?.id === p.id}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )
      )}

      {editing && (
        <EditProductModal
          product={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSuccess={() => toast.success("Producto actualizado", "Los cambios se guardaron correctamente.")}
        />
      )}

      {itemToDelete && (
        <DeleteConfirmModal
          title="Eliminar producto"
          message={`¿Eliminar el producto "${itemToDelete.name}"? Esta acción no se puede deshacer.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setItemToDelete(null)}
          loading={deleting}
        />
      )}
    </>
  );
}
