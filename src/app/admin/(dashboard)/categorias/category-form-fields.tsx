"use client";

import type { CategoryFormErrors } from "@/lib/validations/category";

type Props = {
  errors?: CategoryFormErrors;
  defaults?: { name?: string; order_index?: number };
};

export function CategoryFormFields({ errors = {}, defaults }: Props) {
  return (
    <>
      <div className="min-w-[200px]">
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={defaults?.name}
          placeholder="Ej: Leche, Quesos"
          className={`w-full rounded-lg border px-3 py-2 text-slate-900 shadow-sm outline-none focus:ring-2 ${
            errors.name
              ? "border-red-300 focus:ring-red-500"
              : "border-slate-300 focus:ring-amber-500"
          }`}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>
      <div className="w-24">
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
    </>
  );
}
