import { z } from 'zod';
import { CONTACT_VALIDATION as V } from '../constants/contacts.constants';

const required = () => z.string().trim().min(1, V.required);
export const phone = () => z.string().trim().regex(/^\+\d{1,3}[-\s]?\d{6,14}$/, V.phoneInvalid);

/** Optional contact: either left empty, or every part valid. */
export const optionalPerson = z
  .object({ name: z.string().trim(), email: z.string().trim(), phone: z.string().trim() })
  .superRefine((person, ctx) => {
    const isEmpty = !person.name && !person.email && !person.phone;
    if (isEmpty) {return;}
    if (!person.name) {ctx.addIssue({ code: 'custom', path: ['name'], message: V.required });}
    if (!z.string().email().safeParse(person.email).success) {
      ctx.addIssue({ code: 'custom', path: ['email'], message: person.email ? V.emailInvalid : V.required });
    }
    if (!/^\+\d{1,3}[-\s]?\d{6,14}$/.test(person.phone)) {
      ctx.addIssue({ code: 'custom', path: ['phone'], message: person.phone ? V.phoneInvalid : V.required });
    }
  });

export const supportContactsSchema = z.object({
  sponsorManager: z.object({
    name: required(),
    organization: required(),
    email: required().email(V.emailInvalid),
    phone: phone(),
  }),
  croName: z.string().trim(),
  croManager: optionalPerson,
  croAssistantManager: optionalPerson,
});

export type SupportContactsFormValues = z.infer<typeof supportContactsSchema>;
