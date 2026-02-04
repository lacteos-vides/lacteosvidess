"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";

type Toast = {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
};

type ToastContextValue = {
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((type: ToastType, message: string, description?: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => {
      const next = [...prev, { id, type, message, description }];
      return next.slice(-3);
    });
    setTimeout(() => remove(id), 5000);
  }, [remove]);

  const success = useCallback((message: string, description?: string) => {
    add("success", message, description);
  }, [add]);

  const error = useCallback((message: string, description?: string) => {
    add("error", message, description);
  }, [add]);

  const value = useMemo(() => ({ success, error }), [success, error]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex min-w-[320px] max-w-md items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${
              t.type === "success"
                ? "border-green-200 bg-green-50 text-green-900"
                : "border-red-200 bg-red-50 text-red-900"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 text-red-600" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium">{t.message}</p>
              {t.description && (
                <p className={`mt-0.5 text-sm ${t.type === "success" ? "text-green-700" : "text-red-700"}`}>
                  {t.description}
                </p>
              )}
            </div>
            <button
              onClick={() => remove(t.id)}
              className={`shrink-0 rounded p-1 transition hover:bg-black/10 ${
                t.type === "success" ? "text-green-700" : "text-red-700"
              }`}
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
