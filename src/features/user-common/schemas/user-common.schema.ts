import { z } from 'zod';
import type { PermissionKey } from '@/types';
import { USER_VALIDATION as V } from '../constants/user-common.constants';

const required = () => z.string().trim().min(1, V.required);

/** Identity fields shared by admin, sponsor/CO and site-user forms. */
export function buildIdentityShape(isEmailTaken: (email: string) => boolean) {
  return {
    prefix: required(),
    name: required(),
    email: required()
      .email(V.emailInvalid)
      .refine((email) => !isEmailTaken(email), V.emailTaken),
    status: z.enum(['active', 'inactive']),
  };
}

export const organizationField = () => required();

/** Template + matrix. Template is optional for admin/global rights, required elsewhere. */
export function buildAccessRightsShape(isTemplateRequired: boolean) {
  return {
    templateId: isTemplateRequired ? z.string().min(1, V.templateRequired) : z.string(),
    permissions: z.array(z.custom<PermissionKey>()),
  };
}
