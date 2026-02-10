import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { ScaleToFit } from "@/components/productos/scale-to-fit";
import { TVGalleryBoard } from "@/components/galeria/TVGalleryBoard";
import type { GalleryItem } from "@/lib/types/database";

const CACHE_TAG = "galeria-tv";
const REVALIDATE_SECONDS = 86400; // 24 horas: reduce peticiones a BD

async function fetchGalleryItems(): Promise<GalleryItem[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("galeria")
    .select("id, image_url, product, price, order_index")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });
  return (data ?? []) as GalleryItem[];
}

export default async function GaleriaPage() {
  const getCached = unstable_cache(fetchGalleryItems, [CACHE_TAG], {
    revalidate: REVALIDATE_SECONDS,
    tags: [CACHE_TAG],
  });

  const items = await getCached();

  return (
    <ScaleToFit>
      <div className="h-full w-full">
        <TVGalleryBoard initialItems={items} />
      </div>
    </ScaleToFit>
  );
}
