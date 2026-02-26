"use client";

import { useState } from "react";
import { ProductsTable } from "./products-table";
import { CreateProductForm } from "./create-product-form";

type ProductRow = {
  id: string;
  codigo: string;
  name: string;
  price: number;
  order_index: number;
  category_id: string;
  is_featured?: boolean;
};

type Props = {
  categories: { id: string; name: string; order_index: number }[];
  products: ProductRow[];
};

export function ProductosContent({ categories, products }: Props) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | "all">("all");

  const filteredProducts =
    selectedCategoryId === "all"
      ? products
      : products.filter((p) => p.category_id === selectedCategoryId);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Productos</h2>
          <p className="mt-1 text-slate-600">
            Gestiona productos por categoría con validaciones de precio
          </p>
        </div>
        <CreateProductForm
          categories={categories}
          defaultCategoryId={selectedCategoryId === "all" ? undefined : selectedCategoryId}
          defaultOrder={
            selectedCategoryId === "all"
              ? 1
              : products.filter((p) => p.category_id === selectedCategoryId).length + 1
          }
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategoryId("all")}
          className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition ${
            selectedCategoryId === "all"
              ? "bg-amber-500 text-slate-900"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
        >
          Todas
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
          onClick={() => setSelectedCategoryId(c.id)}
          className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition ${
              selectedCategoryId === c.id
                ? "bg-amber-500 text-slate-900"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            {c.name}
          </button>
        ))}
        </div>
        <span className="text-sm text-slate-500">
          Productos destacados: {products.filter((p) => p.is_featured).length}/14
        </span>
      </div>

      <ProductsTable
        products={filteredProducts}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
      />
    </div>
  );
}
