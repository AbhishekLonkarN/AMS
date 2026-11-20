import { ExternalLink } from 'lucide-react';
import type { QueryStatus } from '@/types';
import type { DataGridColumn } from '@/components/data-grid';
import { QUERY_STATUS_LABELS } from '@/features/site-ecrfs';

export const SITE_QUERY_LABELS = {
  title: 'Queries on eCRFs of Site',
  description: (site: string) => `All queries raised against the data of site ${site}.`,
  searchPlaceholder: 'Search participant, form, field, query…',
  emptyTitle: 'No queries',
  emptyDescription: 'Queries raised on this site’s data appear here.',
  itemLabel: 'queries',
  exportName: 'Queries of site',
  open: 'Open',
  openAria: (field: string) => `Open query on ${field}`,
} as const;

export const SITE_QUERY_COLUMNS = {
  screeningNo: "Participant's Screening No./ID",
  participantNo: "Participant's No./ID",
  initials: "Participant's Initial",
  formTitle: 'Form Title',
  dataField: 'Data Field',
  query: 'Query',
  response: 'Response',
  status: 'Query Status',
} as const;

export interface SiteQueryRow {
  id: string;
  participantId: string;
  screeningNo: string;
  participantNo: string;
  initials: string;
  formKey: string;
  fieldKey: string;
  formTitle: string;
  dataField: string;
  query: string;
  response: string;
  status: QueryStatus;
}

const C = SITE_QUERY_COLUMNS;

export const buildSiteQueryColumns = (
  onOpen: ((row: SiteQueryRow) => void) | undefined,
): DataGridColumn<SiteQueryRow>[] => [
  {
    id: 'screeningNo',
    header: C.screeningNo,
    accessorKey: 'screeningNo',
    meta: { className: 'font-semibold whitespace-nowrap' },
    // The row opens the query in context (the participant's eCRF with the query panel).
    cell: ({ row, getValue }) =>
      onOpen ? (
        <button
          type="button"
          className="link link-primary inline-flex items-center gap-1 font-semibold"
          aria-label={SITE_QUERY_LABELS.openAria(row.original.dataField)}
          onClick={() => onOpen(row.original)}
        >
          {getValue()} <ExternalLink className="size-3.5" aria-hidden />
        </button>
      ) : (
        getValue()
      ),
  },
  { id: 'participantNo', header: C.participantNo, accessorKey: 'participantNo', meta: { className: 'whitespace-nowrap' } },
  { id: 'initials', header: C.initials, accessorKey: 'initials' },
  { id: 'formTitle', header: C.formTitle, accessorKey: 'formTitle', meta: { filterVariant: 'select' } },
  { id: 'dataField', header: C.dataField, accessorKey: 'dataField' },
  { id: 'query', header: C.query, accessorKey: 'query', meta: { isTruncated: true, className: 'max-w-28' } },
  { id: 'response', header: C.response, accessorKey: 'response', meta: { isTruncated: true, className: 'max-w-28' } },
  {
    id: 'status',
    header: C.status,
    accessorFn: (r) => QUERY_STATUS_LABELS[r.status],
    meta: { filterVariant: 'select' },
    cell: ({ getValue }) => <span className="badge badge-soft badge-primary whitespace-nowrap">{getValue()}</span>,
  },
];
