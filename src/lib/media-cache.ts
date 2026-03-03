/**
 * Caché de medios (videos e imágenes) en IndexedDB.
 * Descarga cada URL una sola vez, la guarda localmente y devuelve Blob URLs.
 * Así se evita re-descargar desde Supabase en cada ciclo del carrusel (reduce egress).
 */

const DB_NAME = "lacteos-vides-media";
const STORE_NAME = "blobs";
const DB_VERSION = 1;

/** Promesas de descarga en curso para no duplicar peticiones por la misma URL */
const inFlight = new Map<string, Promise<string>>();

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "url" });
      }
    };
  });
}

function getBlob(url: string): Promise<Blob | null> {
  return openDb().then(
    (db) =>
      new Promise<Blob | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(url);
        req.onsuccess = () => {
          const row = req.result as { url: string; blob: Blob } | undefined;
          resolve(row?.blob ?? null);
        };
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
      })
  );
}

function setBlob(url: string, blob: Blob): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.put({ url, blob });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
      })
  );
}

/**
 * Obtiene una Blob URL para la URL dada: desde IndexedDB si existe, si no descarga, guarda y devuelve.
 * El llamador debe revocar la Blob URL con revokeBlobUrl cuando ya no la use (p. ej. al desmontar).
 */
export function getOrFetchBlobUrl(url: string): Promise<string> {
  const existing = inFlight.get(url);
  if (existing) return existing;

  const promise = (async (): Promise<string> => {
    try {
      const cached = await getBlob(url);
      if (cached) {
        return URL.createObjectURL(cached);
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      await setBlob(url, blob);
      return URL.createObjectURL(blob);
    } finally {
      inFlight.delete(url);
    }
  })();

  inFlight.set(url, promise);
  return promise;
}

/** Revoca una Blob URL creada con getOrFetchBlobUrl para liberar memoria. */
export function revokeBlobUrl(blobUrl: string): void {
  try {
    URL.revokeObjectURL(blobUrl);
  } catch {
    // ignore
  }
}

/** Limpia todas las entradas del caché (útil si en el futuro se invalida por versión). */
export function clearMediaCache(): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
      })
  );
}
