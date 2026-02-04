import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AddVideoForm } from "./add-video-form";

export default async function AddVideoPage() {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("videos")
    .select("order_index")
    .order("order_index", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.order_index ?? 0) + 1;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/videos"
          className="inline-flex cursor-pointer items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          ← Volver a videos
        </Link>
      </div>
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-6 text-2xl font-semibold text-slate-900">Nuevo video</h2>
        <AddVideoForm defaultOrder={nextOrder} />
      </div>
    </div>
  );
}
