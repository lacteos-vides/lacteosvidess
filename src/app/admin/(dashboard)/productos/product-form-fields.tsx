"use client";

import type { ProductFormErrors } from "@/lib/validations/product";

type Category = { id: string; name: string; order_index: number };

type Props = {
  errors?: ProductFormErrors;
  defaults?: {
    codigo?: string;
    name?: string;
    price?: number;
    category_id?: string;
    order_index?: number;
  };
  categories: Category[];
};

export function ProductFormFields({ errors = {}, defaults, categories }: Props) {
  return (
    <div className="space-y-6">
      {/* Datos del producto */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-slate-700">Datos del producto</h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="codigo" className="mb-1 block text-sm font-medium text-slate-700">
              Código *
            </label>
            <input
              id="codigo"
              name="codigo"
              type="text"
              defaultValue={defaults?.codigo}
              placeholder="LECHE-001"
              className={`w-full rounded-lg border px-3 py-2 text-slate-900 shadow-sm outline-none focus:ring-2 ${
                errors.codigo ? "border-red-300 focus:ring-red-500" : "border-slate-300 focus:ring-amber-500"
              }`}
            />
            {errors.codigo && <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
              Nombre *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={defaults?.name}
              placeholder="Leche entera 1L"
              className={`w-full rounded-lg border px-3 py-2 text-slate-900 shadow-sm outline-none focus:ring-2 ${
                errors.name ? "border-red-300 focus:ring-red-500" : "border-slate-300 focus:ring-amber-500"
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="price" className="mb-1 block text-sm font-medium text-slate-700">
              Precio ($) *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              max={999999.99}
              step={0.01}
              defaultValue={defaults?.price ?? ""}
              placeholder="0.00"
              className={`w-full rounded-lg border px-3 py-2 text-slate-900 shadow-sm outline-none focus:ring-2 ${
                errors.price ? "border-red-300 focus:ring-red-500" : "border-slate-300 focus:ring-amber-500"
              }`}
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
          </div>
        </div>
      </div>

      {/* Categoría y orden */}
      <div className="border-t border-slate-200 pt-6">
        <h4 className="mb-3 text-sm font-semibold text-slate-700">Categoría</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="category_id" className="mb-1 block text-sm font-medium text-slate-700">
              Categoría *
            </label>
            <select
              id="category_id"
              name="category_id"
              defaultValue={defaults?.category_id ?? ""}
              className={`w-full rounded-lg border px-3 py-2 text-slate-900 shadow-sm outline-none focus:ring-2 ${
                errors.category_id
                  ? "border-red-300 focus:ring-red-500"
                  : "border-slate-300 focus:ring-amber-500"
              }`}
            >
              <option value="">Seleccionar...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
          </div>

          <div>
            <label htmlFor="order_index" className="mb-1 block text-sm font-medium text-slate-700">
              Orden
            </label>
            <input
              id="order_index"
              name="order_index"
              type="number"
              min={1}
              max={9999}
              defaultValue={defaults?.order_index ?? 1}
              className={`w-full rounded-lg border px-3 py-2 text-slate-900 shadow-sm outline-none focus:ring-2 ${
                errors.order_index
                  ? "border-red-300 focus:ring-red-500"
                  : "border-slate-300 focus:ring-amber-500"
              }`}
            />
            {errors.order_index && <p className="mt-1 text-sm text-red-600">{errors.order_index}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
