/**
 * Validaciones para cambio de contraseña
 */
export const PASSWORD_VALIDATION = {
  minLength: 8,
} as const;

export type PasswordRule = {
  id: string;
  label: string;
  test: (password: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: `Al menos ${PASSWORD_VALIDATION.minLength} caracteres`,
    test: (p) => p.length >= PASSWORD_VALIDATION.minLength,
  },
  {
    id: "number",
    label: "Al menos un número",
    test: (p) => /\d/.test(p),
  },
  {
    id: "special",
    label: "Al menos un carácter especial (!@#$%...)",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

export function isPasswordSecure(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

export type ChangePasswordFormErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export function validateChangePassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): ChangePasswordFormErrors {
  const errors: ChangePasswordFormErrors = {};

  if (!data.currentPassword.trim()) {
    errors.currentPassword = "La contraseña actual es obligatoria";
  }

  if (!data.newPassword) {
    errors.newPassword = "La nueva contraseña es obligatoria";
  } else if (!isPasswordSecure(data.newPassword)) {
    errors.newPassword =
      "La nueva contraseña no cumple los requisitos de seguridad";
  } else if (data.newPassword === data.currentPassword) {
    errors.newPassword = "La nueva contraseña debe ser diferente a la actual";
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = "Confirma la nueva contraseña";
  } else if (data.confirmPassword !== data.newPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden";
  }

  return errors;
}
