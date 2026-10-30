import type { AuditEntry } from '@/types';
import { formatDate, formatTime } from '@/utils/date.utils';
import { AUDIT_TRAIL_LABELS } from '../constants/audit-trail.constants';

/** Flattened, display-ready audit row. Blank "where/what" values show as NA (as in the PDF). */
export interface AuditRow {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  timeZone: string;
  project: string;
  investigator: string;
  participantId: string;
  formPage: string;
  event: string;
  originalValue: string;
  changedTo: string;
  user: string;
}

/** "GMT + 05:30 (Asia/Kolkata)" → "Asia/Kolkata", so times show in the zone they were recorded in. */
const ianaFromLabel = (label: string) => label.match(/\(([^)]+)\)$/)?.[1];

const orNa = (value?: string) => (value && value.trim() ? value : AUDIT_TRAIL_LABELS.na);

export function toAuditRow(entry: AuditEntry): AuditRow {
  const tz = ianaFromLabel(entry.timeZone);
  return {
    id: entry.id,
    timestamp: entry.timestamp,
    date: formatDate(entry.timestamp, tz),
    time: formatTime(entry.timestamp, tz),
    timeZone: entry.timeZone,
    project: orNa(entry.projectName),
    investigator: orNa(entry.investigator),
    participantId: orNa(entry.participantId),
    formPage: entry.formTitle ? `${entry.formTitle} · ${entry.page}` : entry.page,
    event: entry.event,
    originalValue: orNa(entry.originalValue),
    changedTo: orNa(entry.changedTo),
    user: orNa(entry.userEmail),
  };
}
