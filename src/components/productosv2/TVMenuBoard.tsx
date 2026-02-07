"use client";

import { useState, useEffect } from "react";
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

const pages: MenuPage[] = [
  {
    id: 1,
    columns: [
      {
        title: "QUESOS",
        items: [
          { name: "QUESO FRESCO", price: "$4.99" },
          { name: "QUESO OAXACA", price: "$5.99" },
          { name: "QUESO PANELA", price: "$4.49" },
          { name: "QUESO AÑEJO", price: "$7.99" },
          { name: "QUESO MANCHEGO", price: "$8.49" },
          { name: "REQUESÓN", price: "$3.99" },
        ],
      },
      {
        title: "LECHE Y DERIVADOS",
        items: [
          { name: "LECHE ENTERA", price: "$2.49" },
          { name: "LECHE DESLACTOSADA", price: "$2.99" },
          { name: "YOGURT NATURAL", price: "$3.99" },
          { name: "YOGURT GRIEGO", price: "$4.49" },
          { name: "CREMA ÁCIDA", price: "$3.49" },
          { name: "MANTEQUILLA", price: "$4.99" },
        ],
      },
    ],
  },
  {
    id: 2,
    columns: [
      {
        title: "BEBIDAS Y JUGOS",
        items: [
          { name: "JUGO DE NARANJA", price: "$3.50" },
          { name: "JUGO VERDE", price: "$3.99" },
          { name: "CHOCOLATE CALIENTE", price: "$2.99" },
          { name: "LICUADO DE FRESA", price: "$4.50" },
          { name: "LICUADO DE PLÁTANO", price: "$4.00" },
          { name: "AGUA FRESCA", price: "$2.00" },
        ],
      },
      {
        title: "POSTRES Y OTROS",
        items: [
          { name: "ARROZ CON LECHE", price: "$3.00" },
          { name: "FLAN NAPOLITANO", price: "$3.50" },
          { name: "GELATINA DE LECHE", price: "$2.50" },
          { name: "NATILLA", price: "$2.99" },
          { name: "PASTEL DE QUESO", price: "$5.00" },
          { name: "CHONGOS ZAMORANOS", price: "$4.50" },
        ],
      },
    ],
  },
];

export function TVMenuBoard() {
  const [pageIndex, setPageIndex] = useState(0);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const currentPage = pages[pageIndex];
  const totalItemsOnPage = getItemsInPage(currentPage).length;

  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightIndex((prev) => {
        const next = prev + 1;

        if (next >= totalItemsOnPage) {
          setPageIndex((prevPage) => (prevPage + 1) % pages.length);
          return 0;
        }
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [totalItemsOnPage]);

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

        {/* Main Content Area - menos padding para dar más espacio a las cards */}
        <div className="relative flex flex-1 flex-col overflow-hidden p-4 lg:p-6">
          <div className="absolute -translate-y-1/2 translate-x-1/2 right-0 top-0 h-64 w-64 rounded-full bg-yellow-300 opacity-30 blur-[100px]" />
          <div className="absolute bottom-0 left-20 h-96 w-96 translate-y-1/2 rounded-full bg-amber-200 opacity-40 blur-[120px]" />

          <div className="relative z-10 mx-auto flex h-full w-full max-w-[95%] flex-col pb-4">
            {/* Header */}
            <div className="mb-4 text-center lg:mb-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block"
              >
                <h2
                  className="mb-2 text-5xl tracking-wide text-amber-900 drop-shadow-sm lg:text-6xl"
                  style={{ fontFamily: "Impact, sans-serif" }}
                >
                  MENÚ DE PRODUCTOS
                </h2>
                <div className="h-2 w-full rounded-full bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
              </motion.div>
            </div>

            {/* Dynamic Page Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage.id}
                initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -50, filter: "blur(10px)" }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="grid flex-1 grid-cols-2 gap-6 lg:gap-8"
              >
                {currentPage.columns.map((column, colIndex) => {
                  const prevItemsCount = currentPage.columns
                    .slice(0, colIndex)
                    .reduce((acc, col) => acc + col.items.length, 0);

                  return (
                    <div key={column.title} className="flex h-full flex-col">
                      <div className="flex h-full flex-col rounded-3xl border border-white/50 bg-white/70 p-5 shadow-xl backdrop-blur-md lg:p-6">
                        {/* Category Header */}
                        <div className="mb-4 relative">
                          <h3
                            className="border-l-8 border-yellow-500 pl-4 text-3xl text-amber-800 lg:text-4xl"
                            style={{ fontFamily: "Impact, sans-serif" }}
                          >
                            {column.title}
                          </h3>
                        </div>

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
                                  className={`text-3xl font-medium tracking-tight lg:text-4xl ${
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
                                    className={`text-4xl lg:text-5xl ${
                                      isActive
                                        ? "text-amber-700"
                                        : "text-yellow-600"
                                    }`}
                                    style={{ fontFamily: "Impact, sans-serif" }}
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
