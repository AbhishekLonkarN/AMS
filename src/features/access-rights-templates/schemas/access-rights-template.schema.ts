import { z } from 'zod';
import type { PermissionKey } from '@/types';
import { ACCESS_RIGHTS_VALIDATION as V } from '../constants/access-rights.constants';

export function buildTemplateSchema(isNameTaken: (name: string) => boolean) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, V.required)
      .refine((name) => !isNameTaken(name), V.taken),
    userType: z.enum(['admin', 'sponsor', 'co', 'site'], { errorMap: () => ({ message: V.required }) }),
    status: z.enum(['active', 'inactive']),
    permissions: z.array(z.custom<PermissionKey>()).min(1, V.noRights),
  });
}

export type TemplateFormValues = z.infer<ReturnType<typeof buildTemplateSchema>>;
