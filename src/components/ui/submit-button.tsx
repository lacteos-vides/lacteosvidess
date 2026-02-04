"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  loadingText?: string;
};

export function SubmitButton({ children, loadingText = "Guardando...", disabled, className, ...props }: Props) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`inline-flex min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-medium text-slate-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70 ${className ?? ""}`}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
