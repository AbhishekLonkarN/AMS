import { z } from 'zod';
import { MASTER_VALIDATION as V } from '../constants/masters.constants';

/** `isTaken` is read at validation time, so it always sees the latest items / edited id. */
export function buildMasterItemSchema(itemName: string, isTaken: (label: string) => boolean) {
  return z.object({
    label: z
      .string()
      .trim()
      .min(1, V.required)
      .refine((label) => !isTaken(label), V.taken(itemName)),
    description: z.string().trim().min(1, V.required),
    status: z.enum(['active', 'inactive']),
  });
}

export type MasterItemFormValues = z.infer<ReturnType<typeof buildMasterItemSchema>>;
