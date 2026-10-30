import { z } from 'zod';
import { COMPANY_PROFILE_ERRORS as E } from '../constants/company-profile.constants';

const required = () => z.string().trim().min(1, E.required);

export const companyProfileSchema = z.object({
  ownerDisplayName: required(),
  legalName: required(),
  address: required(),
  itAdminUserId: required(),
  itAdminName: required(),
  softwareName: required(),
  logoFileName: z.string().optional(),
});

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;
