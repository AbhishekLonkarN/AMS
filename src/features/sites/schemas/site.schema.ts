import { z } from 'zod';
import { SITE_VALIDATION as V } from '../constants/sites.constants';

const required = () => z.string().trim().min(1, V.required);

/**
 * Site ID is unique within the project (PDF p.26). The Investigator + Email
 * combination rule spans two fields, so it lives in the form's resolver
 * (see useSiteForm) where it can report alongside other field errors.
 */
export function buildSiteSchema(isSiteCodeTaken: (code: string) => boolean) {
  return z.object({
    investigatorName: required(),
    investigatorEmail: required().email(V.emailInvalid),
    siteCode: required().refine((code) => !isSiteCodeTaken(code), V.siteCodeTaken),
    siteName: required(),
    location: required(),
    address: required(),
    expectedRecruitment: z
      .number({ invalid_type_error: V.positiveNumber, required_error: V.required })
      .int(V.positiveNumber)
      .min(1, V.positiveNumber),
    statusId: required(),
  });
}

export type SiteFormValues = z.infer<ReturnType<typeof buildSiteSchema>>;
