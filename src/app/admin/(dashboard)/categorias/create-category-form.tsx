"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CreateCategoryModal } from "./create-category-modal";
import { useToast } from "@/components/ui/toast";

type Category = { id: string; name: string; order_index: number };

export function CreateCategoryForm({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const toast = useToast();

  const nextOrder =
    categories.length > 0
      ? Math.max(...categories.map((c) => c.order_index), 0) + 1
      : 1;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 font-medium text-slate-900 transition hover:bg-amber-400"
      >
        <Plus className="h-4 w-4" />
        Nueva categoría
      </button>

      {open && (
        <CreateCategoryModal
          onClose={() => setOpen(false)}
          defaultOrder={nextOrder}
          onSuccess={() => toast.success("Categoría creada", "La categoría se guardó correctamente.")}
        />
      )}
    </>
  );
}
