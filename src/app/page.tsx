"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Package,
  LayoutGrid,
  Images,
  Video,
  ArrowRight,
  Lock,
} from "lucide-react";
import { ScaleToFit } from "@/components/productos/scale-to-fit";

const routes = [
  {
    href: "/productos",
    icon: Package,
    label: "Productos",
    description: "Menú de productos (v1)",
    enabled: true,
  },
  {
    href: "/productosv2",
    icon: LayoutGrid,
    label: "Productos v2",
    description: "Menú de productos con branding",
    enabled: true,
  },
  {
    href: "/galeria",
    icon: Images,
    label: "Galería",
    description: "Carrusel de imágenes",
    enabled: true,
  },
  {
    href: "/videos",
    icon: Video,
    label: "Videos",
    description: "Reproductor de videos",
    enabled: true,
  },
];

export default function HomePage() {
  return (
    <ScaleToFit>
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
        {/* Fondo con imagen de marca + overlay oscuro */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[2px] scale-105"
            style={{ backgroundImage: "url('/brand/BANNER%20PARA%20IMPRESION2.png')" }}
          />
          <div className="absolute inset-0 bg-slate-900/60" />
        </div>

        <div className="relative z-10 w-full max-w-[920px] px-12">
          {/* Card central tipo login */}
          <div className="rounded-3xl border border-slate-700/50 bg-slate-800/50 p-12 shadow-2xl backdrop-blur-sm">
            {/* Header */}
            <div className="mb-12 text-center">
              <div className="mx-auto mb-6 flex justify-center">
                <Image
                  src="/brand/IMAGEN_PRINCIPAL.png"
                  alt="Lácteos Vides"
                  width={120}
                  height={120}
                  className="h-[120px] w-auto object-contain"
                />
              </div>
              <h1
                className="text-4xl font-bold tracking-tight text-white"
                style={{ fontFamily: "var(--font-display), Impact, sans-serif" }}
              >
                Lácteos Vides
              </h1>
            </div>

            {/* Grid de cards de navegación */}
            <div className="grid grid-cols-2 gap-6">
              {routes.map((route) => {
                const Icon = route.icon;
                const content = (
                  <>
                    <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-xl bg-slate-700/80 text-amber-400 group-hover:bg-amber-500/20 group-hover:text-amber-400">
                      <Icon className="h-9 w-9" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-semibold text-white">{route.label}</h3>
                      <p className="text-base text-slate-400">{route.description}</p>
                    </div>
                    {route.enabled ? (
                      <ArrowRight className="h-7 w-7 shrink-0 text-slate-500 group-hover:text-amber-400" />
                    ) : (
                      <span className="shrink-0 rounded-full bg-slate-600/80 px-4 py-1.5 text-sm font-medium text-slate-400">
                        Próximamente
                      </span>
                    )}
                  </>
                );

                if (route.enabled) {
                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      className="group flex cursor-pointer items-center gap-6 rounded-xl border border-slate-600/50 bg-slate-700/30 p-7 transition hover:border-amber-500/40 hover:bg-slate-700/50"
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <div
                    key={route.href}
                    className="flex cursor-not-allowed items-center gap-6 rounded-xl border border-slate-600/30 bg-slate-700/20 p-7 opacity-75"
                  >
                    <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-xl bg-slate-700/80 text-slate-500">
                      <Icon className="h-9 w-9" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-semibold text-slate-400">{route.label}</h3>
                      <p className="text-base text-slate-500">{route.description}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-600/80 px-4 py-1.5 text-sm font-medium text-slate-500">
                      Próximamente
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Link al admin */}
            <div className="mt-12 border-t border-slate-600/50 pt-8 text-center">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-lg font-medium text-amber-400 transition hover:text-amber-300"
              >
                <Lock className="h-6 w-6" />
                Panel de administración
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ScaleToFit>
  );
}
