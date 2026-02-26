"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateProduct, type ProductFormErrors } from "@/lib/validations/product";

export type ActionResult = { ok: true } | { ok: false; errors: ProductFormErrors };

export async function createProduct(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const codigo = (formData.get("codigo") as string)?.trim() ?? "";
  const name = (formData.get("name") as string)?.trim() ?? "";
  const price = formData.get("price") as string;
  const category_id = formData.get("category_id") as string;
  const order_index = parseInt(String(formData.get("order_index") ?? "1"), 10);

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("products")
    .select("order_index")
    .eq("category_id", category_id);
  const existingOrdersInCategory = (existing ?? []).map((p) => p.order_index);

  const errors = validateProduct({
    codigo,
    name,
    price,
    category_id,
    order_index,
    existingOrdersInCategory,
  });
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const { error } = await supabase.from("products").insert({
    codigo,
    name,
    price: parseFloat(price),
    category_id,
    order_index,
    estado: "activo",
  });

  if (error) {
    return { ok: false, errors: { codigo: error.message } };
  }

  revalidatePath("/admin/productos");
  revalidateTag("productos-tv", { expire: 0 });
  return { ok: true };
}

export async function updateProduct(
  id: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const codigo = (formData.get("codigo") as string)?.trim() ?? "";
  const name = (formData.get("name") as string)?.trim() ?? "";
  const price = formData.get("price") as string;
  const category_id = formData.get("category_id") as string;
  const order_index = parseInt(String(formData.get("order_index") ?? "1"), 10);

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("products")
    .select("order_index")
    .eq("category_id", category_id)
    .neq("id", id);
  const existingOrdersInCategory = (existing ?? []).map((p) => p.order_index);

  const errors = validateProduct({
    codigo,
    name,
    price,
    category_id,
    order_index,
    existingOrdersInCategory,
  });
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  const { error } = await supabase
    .from("products")
    .update({
      codigo,
      name,
      price: parseFloat(price),
      category_id,
      order_index,
    })
    .eq("id", id);

  if (error) {
    return { ok: false, errors: { codigo: error.message } };
  }

  revalidatePath("/admin/productos");
  revalidateTag("productos-tv", { expire: 0 });
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/productos");
  revalidateTag("productos-tv", { expire: 0 });
  return { ok: true };
}

export async function reorderProducts(
  categoryId: string,
  updates: { id: string; order_index: number }[]
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  for (const { id, order_index } of updates) {
    const { error } = await supabase
      .from("products")
      .update({ order_index })
      .eq("id", id)
      .eq("category_id", categoryId);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath("/admin/productos");
  revalidateTag("productos-tv", { expire: 0 });
  return { ok: true };
}

const MAX_FEATURED = 14;

export type ToggleFeaturedResult = { ok: true; is_featured: boolean } | { ok: false; error: string };

export async function toggleProductFeatured(
  id: string,
  currentFeatured: boolean
): Promise<ToggleFeaturedResult> {
  const supabase = await createClient();

  if (!currentFeatured) {
    const { count, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_featured", true);
    if (countError) return { ok: false, error: countError.message };
    if ((count ?? 0) >= MAX_FEATURED) {
      return { ok: false, error: `Máximo ${MAX_FEATURED} productos destacados. Quita la estrellita a otro para agregar este.` };
    }
  }

  const newValue = !currentFeatured;
  const { error } = await supabase
    .from("products")
    .update({ is_featured: newValue })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/productos");
  revalidateTag("productos-tv", { expire: 0 });
  return { ok: true, is_featured: newValue };
}
