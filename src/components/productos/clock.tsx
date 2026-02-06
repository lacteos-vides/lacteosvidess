"use client";

import { useEffect, useState } from "react";

/**
 * Reloj aislado: actualiza cada 20s para reducir re-renders del árbol principal.
 */
export function Clock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 20000); // 20 segundos
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="animate-clock-pulse text-right">
      <div className="text-3xl font-bold text-yellow-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
        {currentTime.toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
      <div className="text-lg text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        {currentTime.toLocaleDateString("es-MX", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </div>
    </div>
  );
}
