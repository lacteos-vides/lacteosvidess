"use client";

/* Migrado desde Lacteos vides tv mockups nuevo - scale-to-fit para TV */

import { ScaleToFit } from "@/components/productos/scale-to-fit";
import { TVMenuBoard } from "@/components/productosv2/TVMenuBoard";

export default function ProductosV2Page() {
  return (
    <ScaleToFit>
      <div className="h-full w-full">
        <TVMenuBoard />
      </div>
    </ScaleToFit>
  );
}
