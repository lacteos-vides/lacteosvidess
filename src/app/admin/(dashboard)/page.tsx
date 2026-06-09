import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  FolderOpen,
  Package,
  Images,
  Video,
  ArrowRight,
  KeyRound,
  Hand,
} from "lucide-react";

function getDisplayName(email: string): string {
  const local = email.split("@")[0] ?? "";
  const match = local.match(/^([a-zA-Z]+)/);
  const raw = match?.[1] ?? local;
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

function getInitials(email: string): string {
  const name = getDisplayName(email);
  return name.slice(0, 2).toUpperCase();
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
          <p className="mt-1 text-slate-600">
            Gestiona categorías, productos y videos desde el panel de
            administración.
          </p>
        </div>

        {user?.email && (
          <div className="flex shrink-0 items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-sm font-bold tracking-wide text-white shadow-sm"
              aria-hidden
            >
              {getInitials(user.email)}
            </div>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm text-slate-500">
                <Hand className="h-3.5 w-3.5 text-amber-500" />
                Bienvenido de nuevo
              </p>
              <p className="mt-0.5 truncate text-lg font-semibold text-slate-900">
                ¡Hola, {getDisplayName(user.email)}!
              </p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/categorias"
          className="group flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-amber-200 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600 group-hover:bg-amber-200">
            <FolderOpen className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Categorías</h3>
            <p className="text-sm text-slate-500">
              Organizar categorías y orden
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-amber-500" />
        </Link>

        <Link
          href="/admin/productos"
          className="group flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-amber-200 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600 group-hover:bg-amber-200">
            <Package className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Productos</h3>
            <p className="text-sm text-slate-500">
              Crear, editar y eliminar productos
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-amber-500" />
        </Link>

        <Link
          href="/admin/galeria"
          className="group flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-amber-200 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600 group-hover:bg-amber-200">
            <Images className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Galería</h3>
            <p className="text-sm text-slate-500">
              Imágenes y promociones para carrusel
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-amber-500" />
        </Link>

        <Link
          href="/admin/videos"
          className="group flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-amber-200 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600 group-hover:bg-amber-200">
            <Video className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Videos</h3>
            <p className="text-sm text-slate-500">
              Subir videos y gestionar el orden
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-amber-500" />
        </Link>

        <Link
          href="/admin/cuenta"
          className="group flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-amber-200 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600 group-hover:bg-amber-200">
            <KeyRound className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Cuenta</h3>
            <p className="text-sm text-slate-500">
              Cambiar contraseña de acceso
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-amber-500" />
        </Link>
      </div>
    </div>
  );
}
