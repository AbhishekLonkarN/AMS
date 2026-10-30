import type { AuditEntry } from '@/types';

const IST = 'GMT + 05:30 (Asia/Kolkata)';

/** Example rows from the PDF audit trail; newest first. */
export const AUDIT_SEED: AuditEntry[] = [
  {
    id: 'aud-seed-4',
    timestamp: '2026-10-10T09:29:00.000Z',
    timeZone: IST,
    page: 'Sponsor and CO User Management',
    event: 'Edited user kbhatt@amsltd.com: Email',
    originalValue: 'kbhatt@amsltd.com',
    changedTo: 'kunal.bhatt@amsltd.com',
    userEmail: 'abcd.pqrs@amsltd.com',
  },
  {
    id: 'aud-seed-3',
    timestamp: '2026-10-10T09:28:00.000Z',
    timeZone: IST,
    page: 'Sponsor and CO User Management',
    event: 'Edited user kunal.bhatt@amsltd.com: Email',
    originalValue: 'kunal.bhatt@amsltd.com',
    changedTo: 'kbhatt@amsltd.com',
    userEmail: 'abcd.pqrs@amsltd.com',
  },
  {
    id: 'aud-seed-2',
    timestamp: '2026-10-10T09:27:00.000Z',
    timeZone: IST,
    page: 'Log-in',
    event: 'Log-in attempt successful for User dr.jpatel@amsltd.com',
    userEmail: 'dr.jpatel@amsltd.com',
  },
  {
    id: 'aud-seed-1',
    timestamp: '2026-10-10T09:25:00.000Z',
    timeZone: IST,
    page: 'Log-in',
    event: 'Log-in attempt failed for User dr.jpatel@amsltd.com',
  },
];
