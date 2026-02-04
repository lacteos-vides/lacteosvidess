"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { X } from "lucide-react";
import { FormActions } from "@/components/ui/form-actions";
import { useToast } from "@/components/ui/toast";
import type { ActionResult } from "./actions";
import { updateProduct } from "./actions";
import { ProductFormFields } from "./product-form-fields";

type ProductRow = {
  id: string;
  codigo: string;
  name: string;
  price: number;
  order_index: number;
  category_id: string;
};

type Category = { id: string; name: string; order_index: number };

type Props = {
  product: ProductRow;
  categories: Category[];
  onClose: () => void;
  onSuccess?: () => void;
};

export function EditProductModal({ product, categories, onClose, onSuccess }: Props) {
  const [state, formAction] = useActionState(
    (prev: ActionResult, fd: FormData) => updateProduct(product.id, prev, fd),
    { ok: false, errors: {} } as ActionResult
  );
  const toast = useToast();
  const hasShownSuccessRef = useRef(false);
  const lastErrorStateRef = useRef<string>("");

  useEffect(() => {
    if (state.ok) {
      if (!hasShownSuccessRef.current) {
        hasShownSuccessRef.current = true;
        onSuccess?.();
      }
      onClose();
    }
  }, [state.ok, onSuccess, onClose]);

  useEffect(() => {
    if (!state.ok && Object.keys(state.errors).length > 0) {
      const errorKey = JSON.stringify(state.errors);
      if (errorKey !== lastErrorStateRef.current) {
        lastErrorStateRef.current = errorKey;
        const firstError = Object.values(state.errors)[0];
        toast.error("Error al guardar", typeof firstError === "string" ? firstError : "Revisa los campos.");
      }
    }
  }, [state, toast]);

  if (state.ok) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Editar producto</h3>
          <button
            onClick={onClose}
            className="cursor-pointer rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form action={formAction} className="space-y-4">
          <ProductFormFields
            categories={categories}
            errors={state.errors}
            defaults={{
              codigo: product.codigo,
              name: product.name,
              price: product.price,
              category_id: product.category_id,
              order_index: product.order_index,
            }}
          />
          <FormActions
            onCancel={onClose}
            submitText="Guardar"
            loadingText="Guardando..."
          />
        </form>
      </div>
    </div>
  );
}
