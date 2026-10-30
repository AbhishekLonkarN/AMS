import { z } from 'zod';
import { AFFILIATION_VALIDATION as V } from '../constants/affiliation.constants';
import { buildAccessRightsShape } from './user-common.schema';

/** Sponsor → project and CO → site affiliation (template is mandatory, PDF p.23/31). */
export const affiliationSchema = z.object({
  userId: z.string().min(1, V.accountRequired),
  designation: z.string().trim().min(1, V.required),
  timeZone: z.string().min(1, V.required),
  ...buildAccessRightsShape(true),
});

export type AffiliationFormValues = z.infer<typeof affiliationSchema>;
