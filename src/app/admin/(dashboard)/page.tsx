import Link from "next/link";
import { FolderOpen, Package, Video, ArrowRight } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
      <p className="mt-1 text-slate-600">
        Gestiona categorías, productos y videos desde el panel de administración.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
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
      </div>
    </div>
  );
}
