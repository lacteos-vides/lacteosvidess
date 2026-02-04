"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  Package,
  Video,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navLinks = [
  { href: "/admin", icon: LayoutDashboard, label: "Inicio" },
  { href: "/admin/categorias", icon: FolderOpen, label: "Categorías" },
  { href: "/admin/productos", icon: Package, label: "Productos" },
  { href: "/admin/videos", icon: Video, label: "Videos" },
];

export function AdminHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link
            href="/admin"
            className="flex cursor-pointer items-center gap-3 rounded-lg transition hover:opacity-90"
          >
            <Image
              src="/brand/IMAGEN_PRINCIPAL.png"
              alt="Lácteos Vides"
              width={40}
              height={40}
              className="h-9 w-auto object-contain sm:h-10"
            />
            <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">
              Lácteos Vides — Admin
            </h1>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <form action="/api/auth/signout" method="POST" className="ml-2">
              <button
                type="submit"
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Salir
              </button>
            </form>
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex cursor-pointer items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-200 md:hidden ${
          menuOpen ? "bg-black/50 opacity-100" : "pointer-events-none bg-black/0 opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />

      {/* Mobile sidebar panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-72 flex-col border-l border-slate-200 bg-white shadow-xl transition-transform duration-200 ease-out md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
          <span className="font-medium text-slate-900">Menú</span>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="flex cursor-pointer items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
          {navLinks.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
          <div className="mt-2 border-t border-slate-200 pt-2">
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-slate-600 transition hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span className="font-medium">Salir</span>
              </button>
            </form>
          </div>
        </nav>
      </aside>
    </>
  );
}
