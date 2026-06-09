"use client";

import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import {
  isPasswordSecure,
  PASSWORD_RULES,
  validateChangePassword,
} from "@/lib/validations/password";
import { AlertCircle, Check, Loader2, Lock, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  email: string;
};

export function ChangePasswordForm({ email }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const passwordSecure = isPasswordSecure(newPassword);
  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit =
    currentPassword.length > 0 &&
    passwordSecure &&
    passwordsMatch &&
    !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors = validateChangePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors as Record<string, string>);
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (verifyError) {
        setFieldErrors({
          currentPassword: "La contraseña actual es incorrecta",
        });
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(
          updateError.message.includes("same")
            ? "La nueva contraseña debe ser diferente a la actual"
            : updateError.message
        );
        setLoading(false);
        return;
      }

      toast.success(
        "Contraseña actualizada",
        "Tu nueva contraseña ya está activa."
      );
      router.push("/admin");
    } catch {
      setError("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="currentPassword"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Contraseña actual
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 pl-10 text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        {fieldErrors.currentPassword && (
          <p className="mt-1 text-sm text-red-600">
            {fieldErrors.currentPassword}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="newPassword"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Nueva contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 pl-10 text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        {fieldErrors.newPassword && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.newPassword}</p>
        )}

        {newPassword.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {PASSWORD_RULES.map((rule) => {
              const passed = rule.test(newPassword);
              return (
                <li
                  key={rule.id}
                  className={`flex items-center gap-2 text-sm ${
                    passed ? "text-green-600" : "text-slate-500"
                  }`}
                >
                  {passed ? (
                    <Check className="h-4 w-4 shrink-0" />
                  ) : (
                    <X className="h-4 w-4 shrink-0" />
                  )}
                  {rule.label}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Confirmar nueva contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 pl-10 text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        {confirmPassword.length > 0 && (
          <p
            className={`mt-1.5 flex items-center gap-2 text-sm ${
              passwordsMatch ? "text-green-600" : "text-slate-500"
            }`}
          >
            {passwordsMatch ? (
              <>
                <Check className="h-4 w-4" />
                Las contraseñas coinciden
              </>
            ) : (
              <>
                <X className="h-4 w-4" />
                Las contraseñas no coinciden
              </>
            )}
          </p>
        )}
        {fieldErrors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 font-medium text-slate-900 transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Actualizando...
          </>
        ) : (
          "Cambiar contraseña"
        )}
      </button>
    </form>
  );
}
