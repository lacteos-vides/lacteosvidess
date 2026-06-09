export type AuditFields = {
  created_at?: string | null;
  created_by?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
};

export function formatAuditDate(iso: string | null | undefined): string {
  if (!iso) return "—";

  try {
    return new Intl.DateTimeFormat("es", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export function getProductAuditLines(fields: AuditFields): { label: string; value: string }[] {
  const lines: { label: string; value: string }[] = [];

  if (fields.updated_at) {
    const by = fields.updated_by ?? "usuario desconocido";
    lines.push({
      label: "Última edición",
      value: `${formatAuditDate(fields.updated_at)} · ${by}`,
    });
  }

  if (fields.created_at || fields.created_by) {
    const date = formatAuditDate(fields.created_at);
    const by = fields.created_by ? ` · ${fields.created_by}` : "";
    lines.push({
      label: "Creación",
      value: `${date}${by}`,
    });
  }

  if (lines.length === 0) {
    lines.push({
      label: "Sin registro",
      value: "Este producto aún no tiene datos de auditoría.",
    });
  }

  return lines;
}
