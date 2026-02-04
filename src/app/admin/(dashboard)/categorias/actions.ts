"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateCategory, type CategoryFormErrors } from "@/lib/validations/category";

export type ActionResult = { ok: true } | { ok: false; errors: CategoryFormErrors };

export async function createCategory(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get("name") as string)?.trim() ?? "";
  const order_index = parseInt(String(formData.get("order_index") ?? "1"), 10);

  const supabase = await createClient();
  const { data: existing } = await supabase.from("categories").select("order_index");
  const existingOrders = (existing ?? []).map((c) => c.order_index);

  const errors = validateCategory({ name, order_index, existingOrders });
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const { error } = await supabase.from("categories").insert({ name, order_index });

  if (error) {
    return { ok: false, errors: { name: error.message } };
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  return { ok: true };
}

export async function updateCategory(
  id: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get("name") as string)?.trim() ?? "";
  const order_index = parseInt(String(formData.get("order_index") ?? "1"), 10);

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("categories")
    .select("id, order_index")
    .neq("id", id);
  const existingOrders = (existing ?? []).map((c) => c.order_index);

  const errors = validateCategory({ name, order_index, existingOrders });
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const { error } = await supabase
    .from("categories")
    .update({ name, order_index })
    .eq("id", id);

  if (error) {
    return { ok: false, errors: { name: error.message } };
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  return { ok: true };
}

const GENERAL_CATEGORY_ID = "00000000-0000-0000-0000-000000000001";

export async function deleteCategory(id: string): Promise<{ ok: boolean; error?: string }> {
  if (id === GENERAL_CATEGORY_ID) {
    return { ok: false, error: "No se puede eliminar la categoría General" };
  }

  const supabase = await createClient();
  // Mover productos a General antes de eliminar
  await supabase
    .from("products")
    .update({ category_id: GENERAL_CATEGORY_ID })
    .eq("category_id", id);

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  return { ok: true };
}

export async function reorderCategory(id: string, newOrder: number): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  await supabase.from("categories").update({ order_index: newOrder }).eq("id", id);
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  return { ok: true };
}

export async function reorderCategories(
  updates: { id: string; order_index: number }[]
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  for (const { id, order_index } of updates) {
    const { error } = await supabase.from("categories").update({ order_index }).eq("id", id);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  return { ok: true };
}
