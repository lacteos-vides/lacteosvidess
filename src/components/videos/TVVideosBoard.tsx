"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Video } from "@/lib/types/database";

interface TVVideosBoardProps {
  initialVideos: Video[];
}

export function TVVideosBoard({ initialVideos }: TVVideosBoardProps) {
  const items = useMemo(
    () =>
      initialVideos.map((v) => ({
        id: v.id,
        src: v.file_url,
        text: v.name,
      })),
    [initialVideos]
  );

  const [index, setIndex] = useState(0);
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);

  const nextIndex = items.length > 0 ? (index + 1) % items.length : 0;

  // Intenta reproducir con audio (comportamiento ideal). Si el navegador bloquea
  // el autoplay con sonido, hace fallback a mute para que al menos el video se vea;
  // un gesto del usuario más adelante reactiva el audio.
  const playActive = useCallback(() => {
    const el = activeVideoRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.muted = false;
    el.play().catch(() => {
      el.muted = true;
      el.play().catch(() => {});
    });
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    playActive();
  }, [playActive, index, items.length]);

  // Si el autoplay con sonido fue bloqueado, un gesto del usuario (clic/tap)
  // reactiva el audio sobre el video activo.
  useEffect(() => {
    const handleGesture = () => {
      const el = activeVideoRef.current;
      if (!el) return;
      el.muted = false;
      el.play().catch(() => {});
    };
    window.addEventListener("pointerdown", handleGesture);
    return () => window.removeEventListener("pointerdown", handleGesture);
  }, []);

  const handleVideoEnded = useCallback(() => {
    if (items.length === 0) return;
    setIndex((i) => (i + 1) % items.length);
  }, [items.length]);

  const current = items[index];

  if (items.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100">
        <p className="text-xl font-medium text-amber-900">No hay videos disponibles</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 font-sans">
      <div className="flex h-full w-full">
        {/* Left Sidebar - Branding */}
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

        {/* Área derecha: video arriba + card abajo */}
        <div className="relative flex flex-1 flex-col overflow-hidden p-6">
          <div className="absolute -translate-y-1/2 translate-x-1/2 right-0 top-0 h-64 w-64 rounded-full bg-yellow-300 opacity-30 blur-[100px]" />
          <div className="absolute bottom-0 left-20 h-96 w-96 translate-y-1/2 rounded-full bg-amber-200 opacity-40 blur-[120px]" />

          <div className="relative z-10 flex h-full w-full flex-col">
            {/* Video actual + siguiente (precarga ligera). El navegador reutiliza la
                respuesta cacheada del archivo en lugar de re-descargarla del CDN. */}
            <div className="relative flex-1 flex items-center justify-center px-4 pb-2 pt-2">
              <div className="relative h-full w-full overflow-hidden rounded-3xl">
                {[index, nextIndex].map((i) => {
                  const item = items[i];
                  if (!item) return null;
                  const isActive = i === index;

                  return (
                    <motion.div
                      key={item.id}
                      initial={false}
                      animate={{ opacity: isActive ? 1 : 0 }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <div className="absolute inset-0 overflow-hidden rounded-3xl bg-white/30 shadow-2xl ring-1 ring-white/50 backdrop-blur-sm">
                        <video
                          ref={isActive ? activeVideoRef : undefined}
                          src={item.src}
                          playsInline
                          autoPlay={isActive}
                          muted={!isActive}
                          preload={isActive ? "auto" : "metadata"}
                          onEnded={isActive ? handleVideoEnded : undefined}
                          onCanPlay={
                            isActive
                              ? (e) => {
                                  const el = e.currentTarget;
                                  el.play().catch(() => {
                                    el.muted = true;
                                    el.play().catch(() => {});
                                  });
                                }
                              : undefined
                          }
                          className="h-full w-full rounded-3xl object-cover p-2"
                          style={{ pointerEvents: "none" }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Card inferior - texto centrado */}
            <div className="relative shrink-0 -mb-6 -mx-6 overflow-hidden rounded-t-3xl bg-white/70 px-10 py-6 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md">
              <div className="relative flex min-h-[5rem] items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span
                      className="text-5xl font-bold tracking-wide lg:text-7xl"
                      style={{
                        fontFamily: "var(--font-display), Impact, sans-serif",
                        color: "#78350f",
                      }}
                    >
                      {current.text}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
