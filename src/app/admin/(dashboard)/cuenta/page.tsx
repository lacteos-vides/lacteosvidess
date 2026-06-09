import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "./change-password-form";
import { Mail } from "lucide-react";

export default async function CuentaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/admin/login");
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">Mi cuenta</h2>
      <p className="mt-1 text-slate-600">
        Administra tus credenciales de acceso al panel
      </p>

      <div className="mt-6 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
        <Mail className="h-4 w-4 shrink-0 text-slate-400" />
        <span>
          Sesión iniciada como{" "}
          <span className="font-medium text-slate-900">{user.email}</span>
        </span>
      </div>

      <div className="mt-8">
        <h3 className="mb-4 text-lg font-medium text-slate-900">
          Cambiar contraseña
        </h3>
        <ChangePasswordForm email={user.email} />
      </div>
    </div>
  );
}
