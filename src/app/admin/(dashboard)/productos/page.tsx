import { createClient } from "@/lib/supabase/server";
import { ProductosContent } from "./productos-content";

export default async function ProductosPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("id, name, order_index").order("order_index").order("name"),
    supabase
      .from("products")
      .select("*")
      .order("order_index")
      .order("name"),
  ]);

  return (
    <ProductosContent
      categories={categories ?? []}
      products={products ?? []}
    />
  );
}
