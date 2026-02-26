"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Product {
  name: string;
  price: string;
}

interface MenuColumn {
  title: string;
  items: Product[];
}

interface MenuPage {
  id: number;
  columns: MenuColumn[];
}

const getItemsInPage = (page: MenuPage) => {
  return page.columns.flatMap((col) => col.items);
};

interface TVMenuBoardProps {
  initialPages: MenuPage[];
  /** Si true, no se muestra el título de categoría en cada columna (para Productos v3 destacados) */
  hideColumnTitles?: boolean;
}

export function TVMenuBoard({ initialPages, hideColumnTitles = false }: TVMenuBoardProps) {
  const pages = useMemo(() => initialPages, [initialPages]);
  const [state, setState] = useState({ pageIndex: 0, highlightIndex: 0 });
  const { pageIndex, highlightIndex } = state;

  const currentPage = pages[pageIndex] ?? pages[0];
  const totalItemsOnPage = currentPage ? getItemsInPage(currentPage).length : 0;

  useEffect(() => {
    if (pages.length === 0) return;
    const interval = setInterval(() => {
      setState((s) => {
        const page = pages[s.pageIndex];
        if (!page) return s;
        const total = getItemsInPage(page).length;
        const next = s.highlightIndex + 1;

        if (next >= total) {
          return {
            pageIndex: (s.pageIndex + 1) % pages.length,
            highlightIndex: 0,
          };
        }
        return { ...s, highlightIndex: next };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [pages]);

  if (!currentPage || currentPage.columns.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 font-sans">
        <p className="text-xl text-amber-800">No hay productos disponibles</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 font-sans">
      <div className="flex h-full w-full">
        {/* Left Sidebar - Branding with Animation */}
        <div className="relative z-10 w-[25%] overflow-hidden bg-yellow-400 shadow-2xl">
          <motion.div
            className="h-full w-full"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          >
            <img
              src="/brand/happy-cow.png"
              alt="Lácteos Vides"
              className="h-full w-full object-cover opacity-90"
            />
          </motion.div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-yellow-900/40 to-transparent mix-blend-multiply" />
        </div>

        {/* Main Content Area */}
        <div className="relative flex flex-1 flex-col overflow-hidden px-2 py-4 lg:px-3 lg:py-6">
          <div className="absolute -translate-y-1/2 translate-x-1/2 right-0 top-0 h-64 w-64 rounded-full bg-yellow-300 opacity-30 blur-[100px]" />
          <div className="absolute bottom-0 left-20 h-96 w-96 translate-y-1/2 rounded-full bg-amber-200 opacity-40 blur-[120px]" />

          <div className="relative z-10 mx-auto flex h-full w-full max-w-[99%] flex-col pb-4">
            {/* Header */}
            <div className="mb-4 text-center lg:mb-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block"
              >
                <h2
                  className="mb-2 text-5xl font-bold tracking-wide drop-shadow-sm lg:text-7xl"
                  style={{
                    fontFamily: "var(--font-display), Impact, sans-serif",
                    color: "#78350f",
                  }}
                >
                  MENÚ DE PRODUCTOS
                </h2>
                <div className="h-2 w-full rounded-full bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
              </motion.div>
            </div>

            {/* Dynamic Page Content - fade in/out al cambiar de categorías */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="grid flex-1 grid-cols-2 gap-3 lg:gap-4"
              >
                {currentPage.columns.map((column, colIndex) => {
                  const prevItemsCount = currentPage.columns
                    .slice(0, colIndex)
                    .reduce((acc, col) => acc + col.items.length, 0);

                  return (
                    <div key={`${currentPage.id}-${column.title || colIndex}`} className="flex h-full flex-col">
                      <div className="flex h-full flex-col rounded-3xl border border-white/50 bg-white/70 p-5 shadow-xl backdrop-blur-md lg:p-6">
                        {/* Category Header (oculto en v3 destacados) */}
                        {!hideColumnTitles && column.title && (
                          <div className="mb-4 relative">
                            <h3
                              className="border-l-8 border-yellow-500 pl-4 text-xl font-bold lg:text-6xl"
                              style={{
                                fontFamily: "var(--font-display), Impact, sans-serif",
                                color: "#78350f",
                              }}
                            >
                              {column.title}
                            </h3>
                          </div>
                        )}

                        <div className="flex flex-1 flex-col justify-center gap-3">
                          {column.items.map((product, idx) => {
                            const globalIndex = prevItemsCount + idx;
                            const isActive = globalIndex === highlightIndex;

                            return (
                              <motion.div
                                key={idx}
                                className={`relative flex items-center justify-between rounded-xl px-5 py-4 transition-all duration-500 ${
                                  isActive
                                    ? "scale-[1.02] border-l-4 border-yellow-600 bg-gradient-to-r from-yellow-200 to-yellow-100 shadow-md"
                                    : "border-b border-amber-100 last:border-0"
                                }`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                              >
                                <motion.span
                                  className={`text-3xl font-medium tracking-tight lg:text-5xl ${
                                    isActive
                                      ? "font-bold text-amber-900"
                                      : "text-gray-700"
                                  }`}
                                  animate={{
                                    scale: isActive ? 1.05 : 1,
                                    originX: 0,
                                  }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20,
                                  }}
                                >
                                  {product.name}
                                </motion.span>

                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-4xl font-bold lg:text-6xl ${
                                      isActive ? "text-amber-900" : "text-gray-700"
                                    }`}
                                    style={{
                                      fontFamily: "var(--font-display), Impact, sans-serif",
                                    }}
                                  >
                                    {product.price}
                                  </span>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
