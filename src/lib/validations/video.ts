/**
 * Validaciones para videos
 */
export const VIDEO_VALIDATION = {
  name: {
    minLength: 1,
    maxLength: 200,
  },
  order_index: {
    min: 1,
    max: 999,
  },
};

export type VideoFormErrors = {
  name?: string;
  file?: string;
  order_index?: string;
};

export function validateVideo(data: {
  name: string;
  order_index: number;
  existingOrders?: number[];
  isUpdate?: boolean;
}): VideoFormErrors {
  const errors: VideoFormErrors = {};
  const { name, order_index, existingOrders = [], isUpdate } = data;

  if (!name || typeof name !== "string") {
    errors.name = "El nombre es obligatorio.";
  } else {
    const t = name.trim();
    if (t.length < VIDEO_VALIDATION.name.minLength) {
      errors.name = "El nombre es obligatorio.";
    } else if (t.length > VIDEO_VALIDATION.name.maxLength) {
      errors.name = `Máximo ${VIDEO_VALIDATION.name.maxLength} caracteres.`;
    }
  }

  if (typeof order_index !== "number" || isNaN(order_index)) {
    errors.order_index = "El orden debe ser un número.";
  } else if (order_index < VIDEO_VALIDATION.order_index.min) {
    errors.order_index = "El orden debe ser al menos 1.";
  } else if (order_index > VIDEO_VALIDATION.order_index.max) {
    errors.order_index = `El orden no puede superar ${VIDEO_VALIDATION.order_index.max}.`;
  } else if (existingOrders.includes(order_index)) {
    errors.order_index = "Ese orden ya está en uso.";
  }

  return errors;
}
