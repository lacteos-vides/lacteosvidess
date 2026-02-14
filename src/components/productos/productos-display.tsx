"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock } from "./clock";
import { ProductCard } from "./product-card";

interface Product {
  name: string;
  price: string;
}

interface ProductPage {
  id: number;
  column1: Product[];
  column2: Product[];
}

interface ProductosDisplayProps {
  initialPages: ProductPage[];
}

export function ProductosDisplay({ initialPages }: ProductosDisplayProps) {
  const pages = useMemo(() => initialPages, [initialPages]);
  const [pageIndex, setPageIndex] = useState(0);
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const pageIndexRef = useRef(0);
  const activeProductIndexRef = useRef(0);

  const currentPage = pages[pageIndex] ?? pages[0];
  const totalOnPage = (currentPage?.column1?.length ?? 0) + (currentPage?.column2?.length ?? 0);

  pageIndexRef.current = pageIndex;
  activeProductIndexRef.current = activeProductIndex;

  useEffect(() => {
    if (pages.length === 0) return;

    const timer = setInterval(() => {
      const idx = pageIndexRef.current;
      const page = pages[idx];
      const total = (page?.column1?.length ?? 0) + (page?.column2?.length ?? 0);
      const nextActive = activeProductIndexRef.current + 1;

      if (nextActive >= total) {
        setPageIndex((p) => (p + 1) % pages.length);
        setActiveProductIndex(0);
        activeProductIndexRef.current = 0;
      } else {
        setActiveProductIndex(nextActive);
        activeProductIndexRef.current = nextActive;
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [pages]);

  if (!currentPage || (currentPage.column1.length === 0 && currentPage.column2.length === 0)) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <p className="text-xl text-yellow-300">No hay productos disponibles</p>
      </div>
    );
  }

  const col1Len = currentPage.column1.length;

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(135deg, #000000 0%, #0a0a0a 35%, #171717 50%, #0a0a0a 70%, #000000 100%),
            linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.5) 100%)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <header className="px-10 pb-3 pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <img
                src="/brand/IMAGEN_PRINCIPAL.png"
                alt="Logo Lácteos Vides"
                className="h-28 w-28 rounded-full drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)]"
              />
              <div>
                <h1
                  className="text-7xl font-black text-white drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)]"
                  style={{ fontFamily: "Impact, sans-serif", letterSpacing: "0.05em" }}
                >
                  LÁCTEOS VIDES
                </h1>
                <p
                  className="mt-1 text-2xl font-bold text-yellow-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
                  style={{ fontStyle: "italic" }}
                >
                  La Mejor Calidad al Mejor Precio
                </p>
              </div>
            </div>
            <Clock />
          </div>
        </header>

        <div className="mx-10 mb-3">
          <div className="h-1.5 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 shadow-lg" />
        </div>

        <div className="mb-6 text-center">
          <h2 className="text-5xl font-black text-yellow-300 drop-shadow-[0_6px_12px_rgba(0,0,0,0.9)]">
            NUESTROS PRODUCTOS
          </h2>
        </div>

        <div className="flex-1 overflow-hidden px-8 pb-3 pt-4">
          <div className="mx-auto grid h-full w-full max-w-[1700px] grid-cols-2 gap-x-16 gap-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={pageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="col-span-2 grid grid-cols-2 gap-x-16 gap-y-4"
              >
                <div className="space-y-3">
                  {currentPage.column1.map((product, index) => (
                    <ProductCard
                      key={`p${pageIndex}-col1-${index}`}
                      name={product.name}
                      price={product.price}
                      isActive={activeProductIndex === index}
                      delayMs={0}
                    />
                  ))}
                </div>
                <div className="space-y-3">
                  {currentPage.column2.map((product, index) => (
                    <ProductCard
                      key={`p${pageIndex}-col2-${index}`}
                      name={product.name}
                      price={product.price}
                      isActive={activeProductIndex === col1Len + index}
                      delayMs={0}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <footer className="py-3 text-center">
          <p className="text-3xl font-black text-yellow-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
            🐄 ¡FRESCURA Y CALIDAD GARANTIZADA! 🐄
          </p>
        </footer>
      </div>
    </div>
  );
}
