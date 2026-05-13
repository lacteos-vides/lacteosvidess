"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateVideo, type VideoFormErrors } from "@/lib/validations/video";
import {
  createVideoPresignedUpload,
  deleteVideoObject,
  extractVideoKeyFromPublicUrl,
  ensureVideoHttpCacheHeaders,
  isR2VideoPublicUrl,
  type PresignedVideoUpload,
} from "@/lib/r2";

export type ActionResult = { ok: true } | { ok: false; errors: VideoFormErrors };

const ALLOWED_EXT = ["mp4", "webm", "ogg", "mov"];
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

export type PresignedUploadResult =
  | { ok: true; upload: PresignedVideoUpload }
  | { ok: false; error: string };

/**
 * Genera una presigned URL para subir un video a R2. El cliente debe enviar el
 * archivo con PUT usando exactamente las cabeceras devueltas (Content-Type y
 * Cache-Control), que vienen firmadas.
 */
export async function getVideoUploadUrl(params: {
  filename: string;
  contentType: string;
  size: number;
}): Promise<PresignedUploadResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado." };

  if (!Number.isFinite(params.size) || params.size <= 0) {
    return { ok: false, error: "Tamaño de archivo inválido." };
  }
  if (params.size > MAX_BYTES) {
    return {
      ok: false,
      error: `El video supera el límite de 50 MB. Tamaño: ${(params.size / (1024 * 1024)).toFixed(1)} MB`,
    };
  }

  const ext = params.filename.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXT.includes(ext)) {
    return { ok: false, error: "Formatos permitidos: mp4, webm, ogg, mov" };
  }

  const contentType = params.contentType || "video/mp4";
  const key = `${crypto.randomUUID()}.${ext}`;

  try {
    const upload = await createVideoPresignedUpload({ key, contentType });
    return { ok: true, upload };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudo generar la URL de subida.",
    };
  }
}

/** Guarda el registro del video cuando la subida se hizo desde el cliente (con progreso) */
export async function saveVideoRecord(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get("name") as string)?.trim() ?? "";
  const order_index = parseInt(String(formData.get("order_index") ?? "1"), 10);
  const file_url = (formData.get("file_url") as string)?.trim() ?? "";

  const supabase = await createClient();
  const { data: existing } = await supabase.from("videos").select("order_index");
  const existingOrders = (existing ?? []).map((v) => v.order_index);

  const errors = validateVideo({ name, order_index, existingOrders });
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  if (!file_url) {
    return { ok: false, errors: { file: "Falta la URL del video." } };
  }

  const key = extractVideoKeyFromPublicUrl(file_url);
  if (key && isR2VideoPublicUrl(file_url)) {
    try {
      await ensureVideoHttpCacheHeaders(key);
    } catch (err) {
      return {
        ok: false,
        errors: {
          file:
            err instanceof Error
              ? err.message
              : "No se pudieron fijar las cabeceras HTTP del video en R2.",
        },
      };
    }
  }

  const { error } = await supabase
    .from("videos")
    .insert({ name, file_url, order_index });

  if (error) return { ok: false, errors: { name: error.message } };

  revalidatePath("/admin/videos");
  revalidateTag("videos-tv", { expire: 0 });
  return { ok: true };
}

export async function updateVideo(
  id: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get("name") as string)?.trim() ?? "";
  const order_index = parseInt(String(formData.get("order_index") ?? "1"), 10);

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("videos")
    .select("id, order_index")
    .neq("id", id);
  const existingOrders = (existing ?? []).map((v) => v.order_index);

  const errors = validateVideo({ name, order_index, existingOrders, isUpdate: true });
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const { error: updateError } = await supabase
    .from("videos")
    .update({ name, order_index })
    .eq("id", id);

  if (updateError) {
    return { ok: false, errors: { name: updateError.message } };
  }

  revalidatePath("/admin/videos");
  revalidatePath(`/admin/videos/${id}/edit`);
  revalidateTag("videos-tv", { expire: 0 });
  return { ok: true };
}

/** Actualiza el video cuando la subida del archivo se hizo desde el cliente */
export async function updateVideoWithUrl(
  id: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get("name") as string)?.trim() ?? "";
  const order_index = parseInt(String(formData.get("order_index") ?? "1"), 10);
  const file_url = (formData.get("file_url") as string)?.trim() ?? "";

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("videos")
    .select("id, order_index")
    .neq("id", id);
  const existingOrders = (existing ?? []).map((v) => v.order_index);

  const errors = validateVideo({ name, order_index, existingOrders, isUpdate: true });
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  if (!file_url) {
    return { ok: false, errors: { file: "Falta la URL del video." } };
  }

  const newKey = extractVideoKeyFromPublicUrl(file_url);
  if (newKey && isR2VideoPublicUrl(file_url)) {
    try {
      await ensureVideoHttpCacheHeaders(newKey);
    } catch (err) {
      return {
        ok: false,
        errors: {
          file:
            err instanceof Error
              ? err.message
              : "No se pudieron fijar las cabeceras HTTP del video en R2.",
        },
      };
    }
  }

  const { data: current } = await supabase
    .from("videos")
    .select("file_url")
    .eq("id", id)
    .single();
  const oldKey = current?.file_url
    ? extractVideoKeyFromPublicUrl(current.file_url)
    : null;

  const { error: updateError } = await supabase
    .from("videos")
    .update({ name, order_index, file_url })
    .eq("id", id);

  if (updateError) return { ok: false, errors: { name: updateError.message } };

  if (oldKey && oldKey !== newKey) {
    try {
      await deleteVideoObject(oldKey);
    } catch {
      // Ignorar si falla borrar el antiguo: no debe bloquear la actualización.
    }
  }

  revalidatePath("/admin/videos");
  revalidatePath(`/admin/videos/${id}/edit`);
  revalidateTag("videos-tv", { expire: 0 });
  return { ok: true };
}

export async function deleteVideo(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: video } = await supabase
    .from("videos")
    .select("file_url")
    .eq("id", id)
    .single();
  const key = video?.file_url ? extractVideoKeyFromPublicUrl(video.file_url) : null;
  if (key) {
    try {
      await deleteVideoObject(key);
    } catch {
      // Continuar aunque falle borrar del storage.
    }
  }

  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/videos");
  revalidateTag("videos-tv", { expire: 0 });
  return { ok: true };
}

export async function reorderVideos(
  updates: { id: string; order_index: number }[]
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  for (const { id, order_index } of updates) {
    const { error } = await supabase.from("videos").update({ order_index }).eq("id", id);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath("/admin/videos");
  revalidateTag("videos-tv", { expire: 0 });
  return { ok: true };
}
