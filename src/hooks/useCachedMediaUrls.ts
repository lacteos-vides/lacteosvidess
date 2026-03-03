"use client";

import { useState, useEffect, useRef } from "react";
import { getOrFetchBlobUrl, revokeBlobUrl } from "@/lib/media-cache";

const REVOKE_DELAY_MS = 400;

/**
 * Dado un array de URLs (videos o imágenes), obtiene Blob URLs desde IndexedDB
 * o descarga una sola vez y las cachea. Revoca las Blob URLs con retraso al desmontar
 * para no invalidarlas en React Strict Mode (doble montaje en desarrollo).
 */
export function useCachedMediaUrls(urls: string[]) {
  const [blobUrls, setBlobUrls] = useState<(string | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const blobUrlsRef = useRef<string[]>([]);
  const revokeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (urls.length === 0) {
      setBlobUrls([]);
      setIsLoading(false);
      blobUrlsRef.current = [];
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setBlobUrls([]);

    Promise.all(urls.map((url) => getOrFetchBlobUrl(url)))
      .then((results) => {
        if (cancelled) {
          // No revocar aquí: la misma promesa puede estar en uso por un remount
          // (navegación client-side / Strict Mode) y revocar invalidaría sus URLs.
          return;
        }
        // Revocar las URLs anteriores antes de reemplazar (p. ej. cambio de lista)
        blobUrlsRef.current.forEach(revokeBlobUrl);
        blobUrlsRef.current = results.filter((u): u is string => u != null);
        setBlobUrls(results);
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setBlobUrls(urls.map(() => null));
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
      if (revokeTimeoutRef.current) {
        clearTimeout(revokeTimeoutRef.current);
        revokeTimeoutRef.current = null;
      }
      const toRevoke = [...blobUrlsRef.current];
      revokeTimeoutRef.current = setTimeout(() => {
        toRevoke.forEach(revokeBlobUrl);
        revokeTimeoutRef.current = null;
      }, REVOKE_DELAY_MS);
    };
  }, [urls.join(",")]);

  return { blobUrls, isLoading };
}
