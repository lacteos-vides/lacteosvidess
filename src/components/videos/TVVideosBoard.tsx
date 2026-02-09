"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface VideoItem {
  src: string;
  text: string;
}

const VIDEO_ITEMS: VideoItem[] = [
  { src: "/videos/vid1.mp4", text: "La mejor calidad, al mejor precio" },
  { src: "/videos/vid2.mp4", text: "Lácteos Vides, la mejor calidad" },
  { src: "/videos/vid3.mp4", text: "Lácteos Vides, Tu mejor opción" },
];

export function TVVideosBoard() {
  const [index, setIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Solo reproducir el video activo desde el inicio; pausar los demás
  useEffect(() => {
    videoRefs.current.forEach((ref, i) => {
      if (!ref) return;
      if (i === index) {
        ref.currentTime = 0;
        ref.play().catch(() => {});
      } else {
        ref.pause();
      }
    });
  }, [index]);

  // Cambiar al siguiente slide solo cuando el video actual termine
  const handleVideoEnded = () => {
    setIndex((i) => (i + 1) % VIDEO_ITEMS.length);
  };

  const current = VIDEO_ITEMS[index];

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
            {/* Área del video - todos permanecen en DOM para caché, solo mostramos el activo */}
            <div className="relative flex-1 flex items-center justify-center px-4 pb-2 pt-2">
              <div className="relative h-full w-full overflow-hidden rounded-3xl">
                {VIDEO_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.src}
                    initial={false}
                    animate={{ opacity: i === index ? 1 : 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <div className="absolute inset-0 overflow-hidden rounded-3xl bg-white/30 shadow-2xl ring-1 ring-white/50 backdrop-blur-sm">
                      <video
                        ref={(el) => {
                          videoRefs.current[i] = el;
                        }}
                        src={item.src}
                        muted
                        playsInline
                        preload="auto"
                        onEnded={i === index ? handleVideoEnded : undefined}
                        className="h-full w-full rounded-3xl object-cover p-2"
                        style={{ pointerEvents: "none" }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Card inferior - texto centrado */}
            <div className="relative shrink-0 -mb-6 -mx-6 overflow-hidden rounded-t-3xl bg-white/70 px-10 py-6 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md">
              <div className="relative flex min-h-[5rem] items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.src}
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
