import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditVideoForm } from "./edit-video-form";

export default async function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: video } = await supabase.from("videos").select("*").eq("id", id).single();

  if (!video) notFound();

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
        <h2 className="mb-6 text-2xl font-semibold text-slate-900">Editar video</h2>
        <EditVideoForm video={video} />
      </div>
    </div>
  );
}
