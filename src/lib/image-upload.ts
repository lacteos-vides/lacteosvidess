/**
 * Upload de imágenes a Supabase Storage (bucket gallery) con progreso
 */

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_SIZE_MB = 10;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateImageSize(size: number): string | null {
  if (size > MAX_SIZE_BYTES) {
    return `La imagen supera el límite de ${MAX_SIZE_MB} MB. Tamaño: ${formatFileSize(size)}`;
  }
  return null;
}

export async function uploadImageWithProgress(
  file: File,
  path: string,
  authToken: string,
  onProgress: (percent: number) => void
): Promise<{ publicUrl: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL");
  }

  return new Promise((resolve, reject) => {
    const url = `${supabaseUrl}/storage/v1/object/gallery/${path}`;
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("cache-control", "31536000"); // 1 año: reduce re-descargas desde Supabase

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
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/gallery/${path}`;
        resolve({ publicUrl });
      } else {
        let msg = `Error ${xhr.status}`;
        try {
          const body = JSON.parse(xhr.responseText);
          msg = body?.message || body?.error_description || msg;
        } catch {
          // ignore
        }
        reject(new Error(msg));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Error de red")));
    xhr.addEventListener("abort", () => reject(new Error("Subida cancelada")));

    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${authToken}`);
    xhr.send(formData);
  });
}
