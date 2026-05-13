/**
 * Utilidades para validación de archivos de video y subida con progreso a una
 * presigned URL (Cloudflare R2). Mantenidas en un archivo cliente-seguro.
 */

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_SIZE_MB = 50;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateFileSize(size: number): string | null {
  if (size > MAX_SIZE_BYTES) {
    return `El video supera el límite de ${MAX_SIZE_MB} MB. Tamaño: ${formatFileSize(size)}`;
  }
  return null;
}

/**
 * Sube un archivo con PUT a una presigned URL devolviendo progreso.
 * Los headers deben coincidir con los firmados al generar la URL en el servidor.
 */
export async function uploadFileToPresignedUrl(
  file: File,
  uploadUrl: string,
  headers: Record<string, string>,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      } else {
        onProgress(0);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        const detail = xhr.responseText || xhr.statusText || "";
        reject(new Error(`Error ${xhr.status}: ${detail}`.trim()));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Error de red al subir el video.")));
    xhr.addEventListener("abort", () => reject(new Error("Subida cancelada.")));

    xhr.open("PUT", uploadUrl);
    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value);
    }
    xhr.send(file);
  });
}
