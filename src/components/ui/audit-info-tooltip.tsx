"use client";

import { getProductAuditLines, type AuditFields } from "@/lib/format-audit";
import { Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function AuditInfoTooltip(fields: AuditFields) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const lines = getProductAuditLines(fields);

  useEffect(() => {
    if (!open) return;

    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="cursor-pointer rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-amber-600"
        title="Información de auditoría"
        aria-label="Información de auditoría"
        aria-expanded={open}
      >
        <Info className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="tooltip"
          className="absolute right-0 top-full z-30 mt-1.5 w-72 rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg"
        >
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-amber-600">
            Historial
          </p>
          <ul className="space-y-2.5">
            {lines.map((line) => (
              <li key={line.label} className="text-sm leading-snug">
                <span className="font-medium text-slate-900">{line.label}</span>
                <p className="mt-0.5 text-slate-600">{line.value}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
