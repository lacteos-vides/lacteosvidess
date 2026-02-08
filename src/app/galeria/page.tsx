"use client";

import { ScaleToFit } from "@/components/productos/scale-to-fit";
import { TVGalleryBoard } from "@/components/galeria/TVGalleryBoard";

export default function GaleriaPage() {
  return (
    <ScaleToFit>
      <div className="h-full w-full">
        <TVGalleryBoard />
      </div>
    </ScaleToFit>
  );
}
