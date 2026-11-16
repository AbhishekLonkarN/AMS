import { z } from 'zod';
import { ECRF_TEMPLATE_VALIDATION as V } from '../constants/ecrf-templates.constants';

export function buildEcrfTemplateSchema(isNameTaken: (name: string) => boolean) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, V.nameRequired)
      .max(100, V.nameTooLong)
      .refine((name) => !isNameTaken(name), V.nameTaken),
    productGroupId: z.string().min(1, V.productGroupRequired),
    description: z.string().trim().max(500, V.descriptionTooLong),
    status: z.enum(['active', 'inactive']),
  });
}

export type EcrfTemplateFormValues = z.infer<ReturnType<typeof buildEcrfTemplateSchema>>;
