"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { X } from "lucide-react";
import { createCategory } from "./actions";
import { CategoryFormFields } from "./category-form-fields";
import { FormActions } from "@/components/ui/form-actions";
import { useToast } from "@/components/ui/toast";

type Props = {
  onClose: () => void;
  defaultOrder?: number;
  onSuccess?: () => void;
};

export function CreateCategoryModal({ onClose, defaultOrder = 1, onSuccess }: Props) {
  const [state, formAction] = useActionState(createCategory, { ok: false, errors: {} });
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
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Nueva categoría</h3>
          <button
            onClick={onClose}
            className="cursor-pointer rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form action={formAction} className="space-y-4">
          <CategoryFormFields errors={state.errors} defaults={{ order_index: defaultOrder }} />
          <FormActions
            onCancel={onClose}
            submitText="Crear categoría"
            loadingText="Creando..."
          />
        </form>
      </div>
    </div>
  );
}
