"use client";

import { AlertTriangle } from "lucide-react";

type Props = {
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
};

export function DeleteConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  loading = false,
}: Props) {
  async function handleConfirm() {
    await onConfirm();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-slate-600">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex cursor-pointer justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Eliminando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
