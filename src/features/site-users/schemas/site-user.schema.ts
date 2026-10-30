import { z } from 'zod';
import { buildAccessRightsShape } from '@/features/user-common';
import { SITE_USER_VALIDATION as V } from '../constants/site-users.constants';

interface SiteUserChecks {
  /** Returns an error message, or null when the value is allowed. */
  nameError: (name: string) => string | null;
  emailError: (email: string) => string | null;
}

const required = () => z.string().trim().min(1, V.required);

const check = (fn: (value: string) => string | null) => (value: string, ctx: z.RefinementCtx) => {
  const message = fn(value);
  if (message) ctx.addIssue({ code: z.ZodIssueCode.custom, message });
};

/** Name and Email ID are unique within the site (PDF p.34); template mandatory. */
export function buildSiteUserSchema({ nameError, emailError }: SiteUserChecks) {
  return z.object({
    prefix: required(),
    name: required().superRefine(check(nameError)),
    email: required().email(V.emailInvalid).superRefine(check(emailError)),
    status: z.enum(['active', 'inactive']),
    designation: required(),
    timeZone: required(),
    ...buildAccessRightsShape(true),
  });
}

export type SiteUserFormValues = z.infer<ReturnType<typeof buildSiteUserSchema>>;
