import { z } from 'zod';
import { buildAccessRightsShape, buildIdentityShape, organizationField } from '@/features/user-common';

export function buildAccountSchema(isEmailTaken: (email: string) => boolean) {
  return z.object({
    ...buildIdentityShape(isEmailTaken),
    organization: organizationField(),
    accountType: z.enum(['sponsor', 'co']),
    // Global rights: template optional (assumption 2).
    ...buildAccessRightsShape(false),
  });
}

export type AccountFormValues = z.infer<ReturnType<typeof buildAccountSchema>>;
