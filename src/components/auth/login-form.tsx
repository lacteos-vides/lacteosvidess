"use client";

import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(
          authError.message === "Invalid login credentials"
            ? "Email o contraseña incorrectos"
            : authError.message
        );
        setLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Ocurrió un error. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full max-w-lg min-w-[320px]">
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-8 shadow-2xl backdrop-blur-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <img
              src="/brand/IMAGEN_PRINCIPAL.png"
              alt="Lácteos Vides"
              className="h-20 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Lácteos Vides
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Panel de administración
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lacteosvides.com"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 py-3 pl-10 pr-4 text-white placeholder-slate-500 outline-none transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 py-3 pl-10 pr-4 text-white placeholder-slate-500 outline-none transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 font-medium text-slate-900 transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Solo usuarios autorizados pueden acceder
        </p>
      </div>
    </div>
  );
}
