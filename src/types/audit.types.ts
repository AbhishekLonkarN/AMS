import type { Id, IsoDateTime } from './common.types';

/** One row of the audit trail, grouped When / Where / What / Who. */
export interface AuditEntry {
  id: Id;
  // When
  timestamp: IsoDateTime;
  timeZone: string;
  // Where
  projectName?: string;
  investigator?: string;
  participantId?: string;
  formTitle?: string;
  page: string;
  // What
  event: string;
  originalValue?: string;
  changedTo?: string;
  // Who
  userEmail?: string;
}
