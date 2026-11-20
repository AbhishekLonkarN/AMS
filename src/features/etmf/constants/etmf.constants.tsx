import { FileText } from 'lucide-react';
import type { EtmfDocument, EtmfScope } from '@/types';
import type { DataGridColumn } from '@/components/data-grid';
import { formatDate } from '@/utils/date.utils';

export const ETMF_LABELS = {
  title: { project: 'eTMF Documents – Project', site: 'eTMF Documents – Site' },
  description: {
    project: 'Regulatory documents that apply across the whole trial.',
    site: (site: string) => `Regulatory documents of site ${site}.`,
  },
  addButton: 'Add Document',
  addTitle: 'Add Document',
  editTitle: 'Edit Document',
  save: 'Submit',
  searchPlaceholder: 'Search title, reference, file…',
  emptyTitle: 'No documents yet',
  emptyDescription: 'Documents you add appear here, ordered by Document Sr. No.',
  itemLabel: 'documents',
  edit: 'Edit',
  delete: 'Delete',
  deleteTitle: 'Delete document',
  deleteMessage: (title: string) =>
    `Delete “${title}”? It is archived, not destroyed, so the record stays available for inspection.`,
  deleted: (title: string) => `Document “${title}” has been deleted.`,
  added: (title: string) => `Document “${title}” has been added.`,
  saved: (title: string) => `Changes to “${title}” have been saved.`,
  openFile: (file: string) => `${file}: files are not stored in the prototype.`,
  fileHint: 'Any file type. The file name is recorded; nothing is uploaded in the prototype.',
  systemFields: 'Date of upload and uploaded by are set by the system.',
} as const;

export const ETMF_FIELDS = {
  srNo: 'Document Sr. No.',
  title: 'Document Title',
  documentDate: 'Document Date',
  version: 'Version No.',
  validityDate: 'Validity Date',
  file: 'File',
  uploadedAt: 'Uploaded on',
  uploadedBy: 'Uploaded by',
  link: 'Link',
  action: 'Action',
} as const;

export const ETMF_VALIDATION = {
  required: 'This field is required.',
  srNoFormat: 'Use a reference such as 1.1)',
  srNoTaken: 'This Document Sr. No. is already used in this list.',
  fileRequired: 'Choose the document file.',
} as const;

/** "1.2)" sorts before "1.10)" and "2.1)": compares each number in the reference. */
export function compareSrNo(a: string, b: string) {
  const parts = (value: string) => value.match(/\d+/g)?.map(Number) ?? [];
  const left = parts(a);
  const right = parts(b);
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    const diff = (left[i] ?? -1) - (right[i] ?? -1);
    if (diff !== 0) {return diff;}
  }
  return a.localeCompare(b);
}

interface EtmfColumnOptions {
  userName: (id?: string) => string;
  onOpenFile: (document: EtmfDocument) => void;
}

const dash = (value?: string) => value || '—';
const C = ETMF_FIELDS;

export const buildEtmfColumns = ({ userName, onOpenFile }: EtmfColumnOptions): DataGridColumn<EtmfDocument>[] => [
  {
    id: 'srNo',
    header: C.srNo,
    accessorKey: 'srNo',
    sortingFn: (a, b) => compareSrNo(a.original.srNo, b.original.srNo),
    meta: { className: 'font-semibold whitespace-nowrap' },
  },
  { id: 'title', header: C.title, accessorKey: 'title', meta: { className: 'max-w-36 font-medium', isTruncated: true } },
  { id: 'documentDate', header: C.documentDate, accessorFn: (d) => (d.documentDate ? formatDate(d.documentDate) : '—'), meta: { className: 'whitespace-nowrap' } },
  { id: 'version', header: C.version, accessorFn: (d) => dash(d.version), meta: { className: 'whitespace-nowrap' } },
  { id: 'validityDate', header: C.validityDate, accessorFn: (d) => (d.validityDate ? formatDate(d.validityDate) : '—'), meta: { className: 'whitespace-nowrap' } },
  { id: 'uploadedAt', header: C.uploadedAt, accessorFn: (d) => formatDate(d.uploadedAt), meta: { className: 'whitespace-nowrap' } },
  { id: 'uploadedBy', header: C.uploadedBy, accessorFn: (d) => userName(d.uploadedBy), meta: { filterVariant: 'select' } },
  {
    id: 'link',
    header: C.link,
    enableSorting: false,
    enableColumnFilter: false,
    accessorFn: (d) => d.fileName,
    meta: { filterVariant: 'none', className: 'max-w-32' },
    cell: ({ row }) => (
      <button type="button" className="link link-primary inline-flex max-w-full items-center gap-1 text-label" onClick={() => onOpenFile(row.original)}>
        <FileText className="size-4 shrink-0" aria-hidden /> <span className="truncate">{row.original.fileName}</span>
      </button>
    ),
  },
];

export const etmfScopeKey = (scope: EtmfScope) => (scope === 'project' ? 'etmfProject' : 'etmfSite');
