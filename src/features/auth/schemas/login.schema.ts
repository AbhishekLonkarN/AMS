import { z } from 'zod';
import { LOGIN_VALIDATION } from '../constants/auth.constants';

export const loginSchema = z.object({
  email: z.string().trim().min(1, LOGIN_VALIDATION.emailRequired).email(LOGIN_VALIDATION.emailInvalid),
  password: z.string().min(1, LOGIN_VALIDATION.passwordRequired),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
