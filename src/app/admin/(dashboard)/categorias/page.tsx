import { createClient } from "@/lib/supabase/server";
import { CategoriesTable } from "./categories-table";
import { CreateCategoryForm } from "./create-category-form";

export default async function CategoriasPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("order_index", { ascending: true })
    .order("name", { ascending: true });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Categorías</h2>
          <p className="mt-1 text-slate-600">
            Organiza las categorías y su orden de visualización
          </p>
        </div>
        <CreateCategoryForm categories={categories ?? []} />
      </div>

      <CategoriesTable categories={categories ?? []} />
    </div>
  );
}
