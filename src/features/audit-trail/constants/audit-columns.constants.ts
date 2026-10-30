import type { DataGridColumn } from '@/components/data-grid';
import type { AuditRow } from '../utils/audit-trail.utils';
import { AUDIT_COLUMN_LABELS as C, AUDIT_GROUP_LABELS as G } from './audit-trail.constants';

const LONG_TEXT = 'min-w-48 max-w-xs whitespace-normal break-words text-label';

/** Grouped When / Where / What / Who headers, as in the PDF audit trail. */
export const AUDIT_COLUMNS: DataGridColumn<AuditRow>[] = [
  {
    id: 'when',
    header: G.when,
    columns: [
      {
        // Sort by the real timestamp; display the formatted date.
        id: 'date',
        header: C.date,
        accessorKey: 'timestamp',
        cell: ({ row }) => row.original.date,
        meta: { className: 'whitespace-nowrap' },
      },
      { id: 'time', header: C.time, accessorKey: 'time', enableSorting: false },
      { id: 'timeZone', header: C.timeZone, accessorKey: 'timeZone', meta: { filterVariant: 'select', className: 'text-label' } },
    ],
  },
  {
    id: 'where',
    header: G.where,
    columns: [
      { id: 'project', header: C.project, accessorKey: 'project', meta: { filterVariant: 'select' } },
      { id: 'investigator', header: C.investigator, accessorKey: 'investigator', meta: { filterVariant: 'select' } },
      { id: 'participantId', header: C.participantId, accessorKey: 'participantId' },
      { id: 'formPage', header: C.formPage, accessorKey: 'formPage', meta: { filterVariant: 'select' } },
    ],
  },
  {
    id: 'what',
    header: G.what,
    columns: [
      { id: 'event', header: C.event, accessorKey: 'event', meta: { className: LONG_TEXT } },
      { id: 'originalValue', header: C.originalValue, accessorKey: 'originalValue', meta: { className: LONG_TEXT } },
      { id: 'changedTo', header: C.changedTo, accessorKey: 'changedTo', meta: { className: LONG_TEXT } },
    ],
  },
  {
    id: 'who',
    header: G.who,
    columns: [{ id: 'user', header: C.user, accessorKey: 'user', meta: { filterVariant: 'select' } }],
  },
];
