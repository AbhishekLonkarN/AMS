import type { DataQuery, Participant, QueryStatus } from '@/types';
import { NOT_STARTED_LABEL } from '@/constants/ecrf-forms.constants';
import { clinicalForms } from '@/features/project-workflows/project-ecrf.utils';

/** The furthest form the participant has reached in the sequence. Derived, never entered. */
export function furthestFormLabel(participant: Participant): string {
  for (let i = participant.forms.length - 1; i >= 0; i -= 1) {
    if (participant.forms[i]?.progress !== 'notStarted') {
      return clinicalForms(participant.ecrfDesign).find((f) => f.key === participant.forms[i]?.formKey)?.shortLabel ?? NOT_STARTED_LABEL;
    }
  }
  return NOT_STARTED_LABEL;
}

/** Same rows the list shows, for a CSV export. */
export const QUERY_STATUS_LABELS: Record<QueryStatus, string> = {
  notRead: 'Not read',
  read: 'Read',
  responded: 'Responded',
  resolved: 'Resolved',
};

/** The unresolved query on a field, if any (one open query per field at a time). */
export const openQueryOf = (queries: DataQuery[]) => queries.find((q) => q.status !== 'resolved');
