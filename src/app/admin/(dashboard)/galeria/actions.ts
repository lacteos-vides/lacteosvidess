"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateGallery, type GalleryFormErrors } from "@/lib/validations/gallery";

const BUCKET = "gallery";

export type ActionResult = { ok: true } | { ok: false; errors: GalleryFormErrors };

export async function createGalleryItem(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const product = (formData.get("product") as string)?.trim() ?? "";
  const price = (formData.get("price") as string)?.trim() ?? "";
  const order_index = parseInt(String(formData.get("order_index") ?? "1"), 10);
  const file = formData.get("file") as File | null;

  const supabase = await createClient();
  const { data: existing } = await supabase.from("galeria").select("order_index");
  const existingOrders = (existing ?? []).map((g) => g.order_index);

  const errors = validateGallery({ product, price, order_index, existingOrders });
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  if (!file || !(file instanceof File) || file.size === 0) {
    return { ok: false, errors: { image: "Selecciona una imagen." } };
  }

  const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
  if (file.size > MAX_BYTES) {
    return {
      ok: false,
      errors: {
        image: `La imagen supera el límite de 10 MB. Tamaño: ${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      },
    };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const allowed = ["jpg", "jpeg", "png", "webp", "gif"];
  if (!allowed.includes(ext)) {
    return { ok: false, errors: { image: "Formatos permitidos: jpg, png, webp, gif" } };
  }

  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    return { ok: false, errors: { image: uploadError.message } };
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const image_url = urlData.publicUrl;

  const { error: insertError } = await supabase
    .from("galeria")
    .insert({ image_url, product, price, order_index });

  if (insertError) {
    await supabase.storage.from(BUCKET).remove([path]);
    return { ok: false, errors: { product: insertError.message } };
  }

  revalidatePath("/admin/galeria");
  revalidateTag("galeria-tv");
  return { ok: true };
}

/** Guarda el registro cuando la subida se hizo desde el cliente */
export async function saveGalleryRecord(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const product = (formData.get("product") as string)?.trim() ?? "";
  const price = (formData.get("price") as string)?.trim() ?? "";
  const order_index = parseInt(String(formData.get("order_index") ?? "1"), 10);
  const image_url = (formData.get("image_url") as string)?.trim() ?? "";

  const supabase = await createClient();
  const { data: existing } = await supabase.from("galeria").select("order_index");
  const existingOrders = (existing ?? []).map((g) => g.order_index);

  const errors = validateGallery({ product, price, order_index, existingOrders });
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  if (!image_url) {
    return { ok: false, errors: { image: "Falta la URL de la imagen." } };
  }

  const { error } = await supabase
    .from("galeria")
    .insert({ image_url, product, price, order_index });

  if (error) return { ok: false, errors: { product: error.message } };

  revalidatePath("/admin/galeria");
  revalidateTag("galeria-tv");
  return { ok: true };
}

export async function updateGalleryItem(
  id: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const product = (formData.get("product") as string)?.trim() ?? "";
  const price = (formData.get("price") as string)?.trim() ?? "";
  const order_index = parseInt(String(formData.get("order_index") ?? "1"), 10);

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("galeria")
    .select("id, order_index")
    .neq("id", id);
  const existingOrders = (existing ?? []).map((g) => g.order_index);

  const errors = validateGallery({ product, price, order_index, existingOrders, isUpdate: true });
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const { error } = await supabase
    .from("galeria")
    .update({ product, price, order_index })
    .eq("id", id);

  if (error) return { ok: false, errors: { product: error.message } };

  revalidatePath("/admin/galeria");
  revalidatePath(`/admin/galeria/${id}/edit`);
  revalidateTag("galeria-tv");
  return { ok: true };
}

export async function updateGalleryItemWithUrl(
  id: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const product = (formData.get("product") as string)?.trim() ?? "";
  const price = (formData.get("price") as string)?.trim() ?? "";
  const order_index = parseInt(String(formData.get("order_index") ?? "1"), 10);
  const image_url = (formData.get("image_url") as string)?.trim() ?? "";

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("galeria")
    .select("id, order_index")
    .neq("id", id);
  const existingOrders = (existing ?? []).map((g) => g.order_index);

  const errors = validateGallery({ product, price, order_index, existingOrders, isUpdate: true });
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  if (!image_url) {
    return { ok: false, errors: { image: "Falta la URL de la imagen." } };
  }

  const { data: current } = await supabase
    .from("galeria")
    .select("image_url")
    .eq("id", id)
    .single();
  const oldPath = current?.image_url
    ? new URL(current.image_url).pathname.split("/").filter(Boolean).pop()
    : null;

  const { error } = await supabase
    .from("galeria")
    .update({ image_url, product, price, order_index })
    .eq("id", id);

  if (error) return { ok: false, errors: { product: error.message } };

  if (oldPath) {
    try {
      await supabase.storage.from(BUCKET).remove([oldPath]);
    } catch {
      // Ignorar si falla borrar el antiguo
    }
  }

  revalidatePath("/admin/galeria");
  revalidatePath(`/admin/galeria/${id}/edit`);
  revalidateTag("galeria-tv");
  return { ok: true };
}

export async function deleteGalleryItem(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("galeria")
    .select("image_url")
    .eq("id", id)
    .single();

  if (item?.image_url) {
    try {
      const segments = new URL(item.image_url).pathname.split("/").filter(Boolean);
      const fileName = segments[segments.length - 1];
      if (fileName) await supabase.storage.from(BUCKET).remove([fileName]);
    } catch {
      // Continuar aunque falle borrar del storage
    }
  }

  const { error } = await supabase.from("galeria").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/galeria");
  revalidateTag("galeria-tv");
  return { ok: true };
}

export async function reorderGalleryItems(
  updates: { id: string; order_index: number }[]
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  for (const { id, order_index } of updates) {
    const { error } = await supabase.from("galeria").update({ order_index }).eq("id", id);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath("/admin/galeria");
  revalidateTag("galeria-tv");
  return { ok: true };
}
