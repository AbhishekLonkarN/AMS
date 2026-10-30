import { z } from 'zod';
import { isSameText } from '@/utils/string.utils';
import { UI_KIT_LABELS } from '../constants/ui-kit.constants';

const E = UI_KIT_LABELS.errors;

export const uiKitFormSchema = z.object({
  prefix: z.string().min(1, E.required),
  name: z
    .string()
    .trim()
    .min(1, E.required)
    .refine((v) => !isSameText(v, 'admin'), E.taken),
  email: z.string().trim().min(1, E.required).email(E.email),
  status: z.string().min(1, E.required),
  description: z.string().trim().min(1, E.required),
  accountId: z.string().min(1, E.required),
});

export type UiKitFormValues = z.infer<typeof uiKitFormSchema>;
