/**
 * Validaciones para productos
 */
export const PRODUCT_VALIDATION = {
  codigo: {
    minLength: 1,
    maxLength: 50,
    pattern: /^[A-Za-z0-9\-\_]+$/,
  },
  name: {
    minLength: 1,
    maxLength: 200,
  },
  price: {
    min: 0,
    max: 999999.99,
    decimals: 2,
  },
  order_index: {
    min: 1,
    max: 9999,
  },
} as const;

export type ProductFormErrors = {
  codigo?: string;
  name?: string;
  price?: string;
  category_id?: string;
  order_index?: string;
};

export function validateProduct(data: {
  codigo: string;
  name: string;
  price: number | string;
  category_id?: string;
  order_index?: number;
  /** Órdenes ya usados en esta categoría (para evitar duplicados) */
  existingOrdersInCategory?: number[];
  /** ID del producto al editar (para excluirlo del chequeo de duplicados) */
  excludeProductId?: string;
}): ProductFormErrors {
  const errors: ProductFormErrors = {};

  const codigo = String(data.codigo || "").trim();
  if (!codigo) {
    errors.codigo = "El código es obligatorio";
  } else if (codigo.length > PRODUCT_VALIDATION.codigo.maxLength) {
    errors.codigo = `Máximo ${PRODUCT_VALIDATION.codigo.maxLength} caracteres`;
  } else if (!PRODUCT_VALIDATION.codigo.pattern.test(codigo)) {
    errors.codigo = "Solo letras, números, guiones y guión bajo";
  }

  const name = String(data.name || "").trim();
  if (!name) {
    errors.name = "El nombre es obligatorio";
  } else if (name.length > PRODUCT_VALIDATION.name.maxLength) {
    errors.name = `Máximo ${PRODUCT_VALIDATION.name.maxLength} caracteres`;
  }

  const priceNum = typeof data.price === "string" ? parseFloat(data.price) : data.price;
  if (isNaN(priceNum)) {
    errors.price = "Precio inválido";
  } else if (priceNum < PRODUCT_VALIDATION.price.min) {
    errors.price = "El precio no puede ser negativo";
  } else if (priceNum > PRODUCT_VALIDATION.price.max) {
    errors.price = `Máximo $${PRODUCT_VALIDATION.price.max.toLocaleString()}`;
  } else {
    const decimals = (String(priceNum).split(".")[1] || "").length;
    if (decimals > PRODUCT_VALIDATION.price.decimals) {
      errors.price = `Máximo ${PRODUCT_VALIDATION.price.decimals} decimales`;
    }
  }

  if (data.category_id !== undefined && !data.category_id) {
    errors.category_id = "Selecciona una categoría";
  }

  const orderIdx = data.order_index ?? 1;
  if (orderIdx < PRODUCT_VALIDATION.order_index.min || orderIdx > PRODUCT_VALIDATION.order_index.max) {
    errors.order_index = `Orden entre ${PRODUCT_VALIDATION.order_index.min} y ${PRODUCT_VALIDATION.order_index.max} (sin 0)`;
  } else if (data.existingOrdersInCategory?.includes(orderIdx)) {
    errors.order_index = "Ese orden ya está usado en esta categoría";
  }

  return errors;
}

export function formatPrice(value: number | string): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(n) ? "" : n.toLocaleString("es-SV", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
