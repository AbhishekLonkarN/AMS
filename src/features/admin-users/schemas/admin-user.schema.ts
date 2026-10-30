import { z } from 'zod';
import { buildAccessRightsShape, buildIdentityShape, organizationField } from '@/features/user-common';

export function buildAdminUserSchema(isEmailTaken: (email: string) => boolean) {
  return z.object({
    ...buildIdentityShape(isEmailTaken),
    organization: organizationField(),
    ...buildAccessRightsShape(false),
  });
}

export type AdminUserFormValues = z.infer<ReturnType<typeof buildAdminUserSchema>>;
