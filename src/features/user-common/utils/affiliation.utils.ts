import type { StatusKind } from '@/components/feedback';
import type { AffiliationStatus, RecordStatus, User } from '@/types';

/** Row status: ended affiliation > In-active account > Active. */
export function affiliationStatusKind(status: AffiliationStatus | RecordStatus, user?: User): StatusKind {
  if (status === 'deaffiliated') return 'deaffiliated';
  if (status === 'inactive' || user?.status === 'inactive') return 'inactive';
  return 'active';
}
