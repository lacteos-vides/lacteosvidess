import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { VideosTable } from "./videos-table";

export default async function VideosPage() {
  const supabase = await createClient();
  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .order("order_index", { ascending: true })
    .order("name", { ascending: true });

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Videos</h2>
          <p className="mt-1 text-slate-600">
            Sube videos publicitarios y gestiona el orden de reproducción
          </p>
        </div>
        <Link
          href="/admin/videos/add"
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 font-medium text-slate-900 transition hover:bg-amber-400"
        >
          <Plus className="h-4 w-4" />
          Nuevo video
        </Link>
      </div>

      <VideosTable videos={videos ?? []} />
    </div>
  );
}
