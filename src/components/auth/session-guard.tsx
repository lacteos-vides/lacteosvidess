"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const CHECK_INTERVAL_MS = 60_000;

export function SessionGuard() {
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session-check", { cache: "no-store" });
        if (res.status === 401) {
          router.replace("/admin/login?reason=session_expired");
        }
      } catch {
        // Sin conexión: no cerrar sesión por un fallo de red puntual
      }
    }

    checkSession();
    const intervalId = window.setInterval(checkSession, CHECK_INTERVAL_MS);
    window.addEventListener("focus", checkSession);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", checkSession);
    };
  }, [router]);

  return null;
}
