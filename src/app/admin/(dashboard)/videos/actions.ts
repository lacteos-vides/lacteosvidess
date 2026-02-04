"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateVideo, type VideoFormErrors } from "@/lib/validations/video";

const BUCKET = "videos";

export type ActionResult = { ok: true } | { ok: false; errors: VideoFormErrors };

export async function createVideo(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get("name") as string)?.trim() ?? "";
  const order_index = parseInt(String(formData.get("order_index") ?? "1"), 10);
  const file = formData.get("file") as File | null;

  const supabase = await createClient();
  const { data: existing } = await supabase.from("videos").select("order_index");
  const existingOrders = (existing ?? []).map((v) => v.order_index);

  const errors = validateVideo({ name, order_index, existingOrders });
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  if (!file || !(file instanceof File) || file.size === 0) {
    return { ok: false, errors: { file: "Selecciona un archivo de video." } };
  }

  const MAX_BYTES = 50 * 1024 * 1024; // 50 MB
  if (file.size > MAX_BYTES) {
    return { ok: false, errors: { file: `El video supera el límite de 50 MB. Tamaño: ${(file.size / (1024 * 1024)).toFixed(1)} MB` } };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const allowed = ["mp4", "webm", "ogg", "mov"];
  if (!allowed.includes(ext)) {
    return { ok: false, errors: { file: "Formatos permitidos: mp4, webm, ogg, mov" } };
  }

  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    return { ok: false, errors: { file: uploadError.message } };
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const file_url = urlData.publicUrl;

  const { error: insertError } = await supabase
    .from("videos")
    .insert({ name, file_url, order_index });

  if (insertError) {
    await supabase.storage.from(BUCKET).remove([path]);
    return { ok: false, errors: { name: insertError.message } };
  }

  revalidatePath("/admin/videos");
  return { ok: true };
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

  const { error } = await supabase
    .from("videos")
    .insert({ name, file_url, order_index });

  if (error) return { ok: false, errors: { name: error.message } };

  revalidatePath("/admin/videos");
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
  return { ok: true };
}

/** Actualiza el video cuando la subida del archivo se hizo desde el cliente (evita límite 1MB) */
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

  const { data: current } = await supabase.from("videos").select("file_url").eq("id", id).single();
  const oldFileName = current?.file_url
    ? new URL(current.file_url).pathname.split("/").pop()
    : null;

  const { error: updateError } = await supabase
    .from("videos")
    .update({ name, order_index, file_url })
    .eq("id", id);

  if (updateError) return { ok: false, errors: { name: updateError.message } };

  if (oldFileName) {
    try {
      await supabase.storage.from(BUCKET).remove([oldFileName]);
    } catch {
      // Ignorar si falla borrar el antiguo
    }
  }

  revalidatePath("/admin/videos");
  revalidatePath(`/admin/videos/${id}/edit`);
  return { ok: true };
}

export async function deleteVideo(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: video } = await supabase.from("videos").select("file_url").eq("id", id).single();
  if (video?.file_url) {
    try {
      const segments = new URL(video.file_url).pathname.split("/");
      const fileName = segments[segments.length - 1];
      if (fileName) await supabase.storage.from(BUCKET).remove([fileName]);
    } catch {
      // Continuar aunque falle borrar del storage
    }
  }

  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/videos");
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
  return { ok: true };
}
