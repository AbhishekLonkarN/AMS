import { Eye, Pencil } from 'lucide-react';
import type { Participant } from '@/types';
import type { DataGridColumn } from '@/components/data-grid';
import { furthestFormLabel } from '../utils/site-ecrfs.utils';
import { SITE_ECRF_COLUMNS as C, SITE_ECRF_LABELS as L } from './site-ecrfs.constants';

interface ParticipantColumnOptions {
  statusLabel: (id?: string) => string;
  onOpen: (participant: Participant) => void;
  /** Site users edit the eCRF; sponsor and CO users only view it. */
  canEdit: boolean;
}

export const buildParticipantColumns = ({ statusLabel, onOpen, canEdit }: ParticipantColumnOptions): DataGridColumn<Participant>[] => [
  { id: 'screeningNo', header: C.screeningNo, accessorKey: 'screeningNo', meta: { className: 'font-semibold whitespace-nowrap' } },
  {
    id: 'participantNo',
    header: C.participantNo,
    // Blank until the participant is enrolled (screen failures never get one).
    accessorFn: (p) => p.participantNo ?? '',
    meta: { className: 'whitespace-nowrap' },
  },
  { id: 'initials', header: C.initials, accessorKey: 'initials' },
  {
    id: 'status',
    header: C.status,
    accessorFn: (p) => statusLabel(p.statusId),
    meta: { filterVariant: 'select' },
    cell: ({ getValue }) => <span className="badge badge-soft badge-primary whitespace-nowrap">{getValue()}</span>,
  },
  {
    id: 'formStatus',
    header: C.formStatus,
    accessorFn: (p) => furthestFormLabel(p),
    meta: { filterVariant: 'select', className: 'whitespace-nowrap' },
  },
  {
    id: 'action',
    header: C.action,
    enableSorting: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    meta: { filterVariant: 'none', className: 'w-44' },
    cell: ({ row }) => (
      <button
        type="button"
        className="btn btn-secondary btn-sm whitespace-nowrap"
        aria-label={canEdit ? L.editAria(row.original.screeningNo) : L.viewAria(row.original.screeningNo)}
        onClick={() => onOpen(row.original)}
      >
        {canEdit ? <Pencil className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}{' '}
        {canEdit ? L.editButton : L.viewButton}
      </button>
    ),
  },
];
