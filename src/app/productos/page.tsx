"use client";

/* Migrado desde mockup de pantalla de productos - diseño aprobado por cliente */

import { useEffect, useState } from "react";
import { motion } from "motion/react";

interface Product {
  id: number;
  name: string;
  price: string;
}

const products: Product[] = [
  { id: 1, name: "Leche Entera 1L", price: "$25.00" },
  { id: 2, name: "Leche Deslactosada 1L", price: "$28.00" },
  { id: 3, name: "Queso Fresco 500g", price: "$65.00" },
  { id: 4, name: "Queso Panela 400g", price: "$55.00" },
  { id: 5, name: "Queso Oaxaca 500g", price: "$75.00" },
  { id: 6, name: "Queso Manchego 500g", price: "$85.00" },
  { id: 7, name: "Yogurt Natural 1L", price: "$35.00" },
  { id: 8, name: "Yogurt de Fresa 1L", price: "$38.00" },
  { id: 9, name: "Crema 500ml", price: "$45.00" },
  { id: 10, name: "Mantequilla 250g", price: "$48.00" },
  { id: 11, name: "Requesón 250g", price: "$32.00" },
  { id: 12, name: "Jocoque 500ml", price: "$35.00" },
  { id: 13, name: "Queso Cottage 250g", price: "$42.00" },
  { id: 14, name: "Leche Descremada 1L", price: "$26.00" },
];

export default function ProductosDisplayPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeProductIndex, setActiveProductIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const highlightTimer = setInterval(() => {
      setActiveProductIndex((prev) => (prev + 1) % products.length);
    }, 2000);
    return () => clearInterval(highlightTimer);
  }, []);

  const midPoint = Math.ceil(products.length / 2);
  const column1 = products.slice(0, midPoint);
  const column2 = products.slice(midPoint);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Fondo con imagen blur */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/brand/BANNER%20PARA%20IMPRESION2.png')",
          filter: "blur(8px)",
          transform: "scale(1.1)",
        }}
      />

      {/* Overlay oscuro para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Contenido principal */}
      <div className="relative z-10 flex h-screen flex-col">
        {/* Header */}
        <motion.header
          className="px-8 pb-4 pt-6"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-6"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <img
                src="/brand/IMAGEN_PRINCIPAL.png"
                alt="Logo Lácteos Vides"
                className="h-28 w-28 rounded-full drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)]"
              />
              <div>
                <h1
                  className="text-7xl font-black text-white drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)]"
                  style={{
                    fontFamily: "Impact, sans-serif",
                    letterSpacing: "0.05em",
                  }}
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
            </motion.div>

            <motion.div
              className="text-right"
              animate={{ opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-3xl font-bold text-yellow-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                {currentTime.toLocaleTimeString("es-MX", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="text-xl text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {currentTime.toLocaleDateString("es-MX", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </div>
            </motion.div>
          </div>
        </motion.header>

        {/* Separador decorativo */}
        <motion.div
          className="mx-8 mb-4"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <div className="h-1.5 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 shadow-lg" />
        </motion.div>

        {/* Título de menú */}
        <motion.div
          className="mb-4 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h2 className="text-5xl font-black text-yellow-300 drop-shadow-[0_6px_12px_rgba(0,0,0,0.9)]">
            NUESTROS PRODUCTOS
          </h2>
        </motion.div>

        {/* Grid de productos en dos columnas */}
        <div className="flex-1 overflow-hidden px-12 pb-4">
          <div className="mx-auto grid h-full max-w-7xl grid-cols-2 gap-12">
            {/* Columna 1 */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {column1.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="flex items-center justify-between rounded-xl border-2 border-yellow-400/30 bg-white/10 px-5 py-3 backdrop-blur-sm transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: activeProductIndex === index ? 1.05 : 1,
                    borderColor:
                      activeProductIndex === index
                        ? "rgba(250, 204, 21, 0.8)"
                        : "rgba(250, 204, 21, 0.3)",
                  }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                >
                  <span className="text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {product.name}
                  </span>
                  <motion.span
                    className="text-3xl font-black text-yellow-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{
                      duration: 2,
                      delay: index * 0.2,
                      repeat: Infinity,
                    }}
                  >
                    {product.price}
                  </motion.span>
                </motion.div>
              ))}
            </motion.div>

            {/* Columna 2 */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {column2.map((product, index) => {
                const globalIndex = midPoint + index;
                return (
                  <motion.div
                    key={product.id}
                    className="flex items-center justify-between rounded-xl border-2 border-yellow-400/30 bg-white/10 px-5 py-3 backdrop-blur-sm transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: activeProductIndex === globalIndex ? 1.05 : 1,
                      borderColor:
                        activeProductIndex === globalIndex
                          ? "rgba(250, 204, 21, 0.8)"
                          : "rgba(250, 204, 21, 0.3)",
                    }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  >
                    <span className="text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {product.name}
                    </span>
                    <motion.span
                      className="text-3xl font-black text-yellow-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        duration: 2,
                        delay: index * 0.2,
                        repeat: Infinity,
                      }}
                    >
                      {product.price}
                    </motion.span>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Footer decorativo */}
        <motion.footer
          className="py-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-block"
          >
            <p className="text-3xl font-black text-yellow-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
              🐄 ¡FRESCURA Y CALIDAD GARANTIZADA! 🐄
            </p>
          </motion.div>
        </motion.footer>
      </div>
    </div>
  );
}
