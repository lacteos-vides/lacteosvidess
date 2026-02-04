/**
 * Validaciones para categorías
 * Orden: mínimo 1 (no se permite 0). Sin duplicados.
 */
export const CATEGORY_VALIDATION = {
  name: {
    minLength: 1,
    maxLength: 100,
  },
  order_index: {
    min: 1,
    max: 9999,
  },
} as const;

export type CategoryFormErrors = {
  name?: string;
  order_index?: string;
};

export function validateCategory(data: {
  name: string;
  order_index?: number;
  /** Órdenes ya usados por otras categorías (o todas si es create) */
  existingOrders?: number[];
}): CategoryFormErrors {
  const errors: CategoryFormErrors = {};

  const name = String(data.name || "").trim();
  if (!name) {
    errors.name = "El nombre es obligatorio";
  } else if (name.length > CATEGORY_VALIDATION.name.maxLength) {
    errors.name = `Máximo ${CATEGORY_VALIDATION.name.maxLength} caracteres`;
  }

  const orderIdx = data.order_index ?? 1;
  if (orderIdx < CATEGORY_VALIDATION.order_index.min || orderIdx > CATEGORY_VALIDATION.order_index.max) {
    errors.order_index = `Orden entre ${CATEGORY_VALIDATION.order_index.min} y ${CATEGORY_VALIDATION.order_index.max} (no 0)`;
  } else if (data.existingOrders?.includes(orderIdx)) {
    errors.order_index = "Ese orden ya está usado por otra categoría";
  }

  return errors;
}
