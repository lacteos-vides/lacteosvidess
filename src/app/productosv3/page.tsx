import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { ScaleToFit } from "@/components/productos/scale-to-fit";
import { TVMenuBoard } from "@/components/productosv2/TVMenuBoard";
import type { ProductWithCategory } from "@/lib/types/database";

const CACHE_TAG = "productos-tv";
const REVALIDATE_SECONDS = 86400; // 24 horas
const MAX_FEATURED = 14;

/** Una sola página con 2 columnas: mitad en cada card (ej. 6+6, 7+6, 7+7) */
function buildFeaturedPage(rows: ProductWithCategory[]) {
  const items = rows.slice(0, MAX_FEATURED).map((p) => ({
    name: p.name.toUpperCase(),
    price: `$${Number(p.price).toFixed(2)}`,
  }));

  const half = Math.ceil(items.length / 2);
  const col1 = items.slice(0, half);
  const col2 = items.slice(half, items.length);

  return [
    {
      id: 1,
      columns: [
        { title: "", items: col1 },
        { title: "", items: col2 },
      ],
    },
  ];
}

async function fetchFeaturedProducts(): Promise<ProductWithCategory[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products_with_category")
    .select("id, name, price, order_index, category_id, category_name, category_order, estado, is_featured")
    .eq("estado", "activo")
    .eq("is_featured", true)
    .order("order_index", { ascending: true })
    .order("name", { ascending: true })
    .limit(MAX_FEATURED);
  return (data ?? []) as ProductWithCategory[];
}

export default async function ProductosV3Page() {
  const getCached = unstable_cache(fetchFeaturedProducts, [CACHE_TAG, "featured"], {
    revalidate: REVALIDATE_SECONDS,
    tags: [CACHE_TAG],
  });

  const rows = await getCached();
  const pages = buildFeaturedPage(rows);
  const hasItems = pages[0]?.columns.some((c) => c.items.length > 0) ?? false;

  if (!hasItems) {
    return (
      <ScaleToFit>
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 font-sans">
          <p className="text-xl text-amber-800">
            No hay productos destacados. Configura hasta 14 en el panel de administración.
          </p>
        </div>
      </ScaleToFit>
    );
  }

  return (
    <ScaleToFit>
      <div className="h-full w-full">
        <TVMenuBoard initialPages={pages} hideColumnTitles />
      </div>
    </ScaleToFit>
  );
}
