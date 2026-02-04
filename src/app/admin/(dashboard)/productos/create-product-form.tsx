"use client";

import { useState, useEffect, useRef } from "react";
import { useActionState } from "react";
import { Plus } from "lucide-react";
import { createProduct } from "./actions";
import { ProductFormFields } from "./product-form-fields";
import { FormActions } from "@/components/ui/form-actions";
import { useToast } from "@/components/ui/toast";

type Category = { id: string; name: string; order_index: number };

type Props = {
  categories: Category[];
  defaultCategoryId?: string;
  defaultOrder?: number;
};

export function CreateProductForm({ categories, defaultCategoryId, defaultOrder = 1 }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createProduct, { ok: false, errors: {} });
  const toast = useToast();
  const lastSuccessStateRef = useRef<unknown>(null);
  const lastErrorStateRef = useRef<string>("");

  useEffect(() => {
    if (state.ok && state !== lastSuccessStateRef.current) {
      lastSuccessStateRef.current = state;
      toast.success("Producto creado", "El producto se guardó correctamente.");
      setOpen(false);
    } else if (open && !state.ok && Object.keys(state.errors).length > 0) {
      const errorKey = JSON.stringify(state.errors);
      if (errorKey !== lastErrorStateRef.current) {
        lastErrorStateRef.current = errorKey;
        const firstError = Object.values(state.errors)[0];
        toast.error("Error al guardar", typeof firstError === "string" ? firstError : "Revisa los campos.");
      }
    }
  }, [state, open, toast]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 font-medium text-slate-900 transition hover:bg-amber-400"
      >
        <Plus className="h-4 w-4" />
        Nuevo producto
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Nuevo producto</h3>
              <button
                onClick={() => setOpen(false)}
                className="cursor-pointer rounded p-1 text-slate-500 hover:bg-slate-100"
              >
                ×
              </button>
            </div>
            <form action={formAction} className="space-y-4">
              <ProductFormFields
                categories={categories}
                errors={state.ok ? {} : state.errors}
                defaults={
                  defaultCategoryId
                    ? { category_id: defaultCategoryId, order_index: defaultOrder }
                    : undefined
                }
              />
              <FormActions
                onCancel={() => setOpen(false)}
                submitText="Crear producto"
                loadingText="Creando..."
              />
            </form>
          </div>
        </div>
      )}
    </>
  );
}
