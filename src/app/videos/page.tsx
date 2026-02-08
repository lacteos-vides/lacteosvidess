"use client";

import { ScaleToFit } from "@/components/productos/scale-to-fit";
import { TVVideosBoard } from "@/components/videos/TVVideosBoard";

export default function VideosPage() {
  return (
    <ScaleToFit>
      <div className="h-full w-full">
        <TVVideosBoard />
      </div>
    </ScaleToFit>
  );
}
