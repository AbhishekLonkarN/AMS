import { z } from 'zod';
import { CONTACT_VALIDATION as V } from '../constants/contacts.constants';
import { optionalPerson, phone } from './support-contacts.schema';

/** The editable parts of the Site Contacts card (Site p.14): the PI's phone, the SMO and the two CRCs. */
export const siteContactsSchema = z.object({
  investigatorPhone: phone().min(1, V.required),
  smoName: z.string().trim(),
  crc1: optionalPerson,
  crc2: optionalPerson,
});

export type SiteContactsFormValues = z.infer<typeof siteContactsSchema>;
