import { z } from 'zod';
import { MASTER_VALIDATION as V } from '../constants/masters.constants';

/** The backend's limits for a Product Group code and description; applied to every master alike. */
const LABEL_MAX = 50;
const DESCRIPTION_MAX = 200;

/** `isTaken` is read at validation time, so it always sees the latest items / edited id. */
export function buildMasterItemSchema(itemName: string, isTaken: (label: string) => boolean) {
  return z.object({
    label: z
      .string()
      .trim()
      .min(1, V.required)
      .max(LABEL_MAX, V.tooLong(LABEL_MAX))
      .refine((label) => !isTaken(label), V.taken(itemName)),
    description: z.string().trim().min(1, V.required).max(DESCRIPTION_MAX, V.tooLong(DESCRIPTION_MAX)),
    status: z.enum(['active', 'inactive']),
  });
}

export type MasterItemFormValues = z.infer<ReturnType<typeof buildMasterItemSchema>>;
