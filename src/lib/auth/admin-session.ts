/** Duración máxima de sesión del panel admin: 24 horas */
export const ADMIN_SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const ADMIN_SESSION_MAX_AGE_SECONDS = 24 * 60 * 60;
export const ADMIN_SESSION_LABEL = "24 horas";
export const ADMIN_SESSION_COOKIE = "lv_admin_session_start";

export function isAdminSessionExpired(
  sessionStartCookie: string | undefined
): boolean {
  if (!sessionStartCookie) return true;

  const started = Number(sessionStartCookie);
  if (Number.isNaN(started)) return true;

  return Date.now() - started > ADMIN_SESSION_MAX_AGE_MS;
}

export function getAdminSessionCookieOptions() {
  return {
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };
}
