import { z } from 'zod';
import { EMAIL_FORMAT, EMAIL_MAX_LENGTH, LOGIN_VALIDATION } from '../constants/auth.constants';

/**
 * Client-side checks for the sign-in form. The email is trimmed before it is checked; the password is kept exactly as
 * typed (spaces and case matter) and gets no complexity or minimum-length rule at sign-in.
 * The authentication service stays the final authority.
 */
export const emailField = z
  .string()
  .trim()
  .min(1, LOGIN_VALIDATION.emailRequired)
  .max(EMAIL_MAX_LENGTH, LOGIN_VALIDATION.emailTooLong)
  .regex(EMAIL_FORMAT, LOGIN_VALIDATION.emailInvalid);

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, LOGIN_VALIDATION.passwordRequired),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
