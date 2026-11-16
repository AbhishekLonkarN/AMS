import { z } from 'zod';
import { NEW_PASSWORD_MAX_LENGTH, RESET_VALIDATION } from '../constants/auth.constants';
import { checkNewPassword } from '../utils/password.utils';

/**
 * The new password must meet every rule (see PASSWORD_RULES) and is kept exactly as typed.
 * Only used when setting a password; signing in has no complexity rules.
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, RESET_VALIDATION.passwordRequired)
      .max(NEW_PASSWORD_MAX_LENGTH, RESET_VALIDATION.passwordTooLong)
      .refine((value) => checkNewPassword(value).isValid, RESET_VALIDATION.passwordWeak),
    confirmPassword: z.string().min(1, RESET_VALIDATION.confirmRequired),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: RESET_VALIDATION.confirmMismatch,
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
