"use client";

import { useFormStatus } from "react-dom";
import { SubmitButton } from "./submit-button";

type Props = {
  onCancel: () => void;
  submitText?: string;
  loadingText?: string;
};

export function FormActions({ onCancel, submitText = "Guardar", loadingText = "Guardando..." }: Props) {
  const { pending } = useFormStatus();

  return (
    <div className="flex cursor-pointer justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={pending}
        className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Cancelar
      </button>
      <SubmitButton loadingText={loadingText}>{submitText}</SubmitButton>
    </div>
  );
}
