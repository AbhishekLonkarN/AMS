import type { Site } from '@/types';
import { createSrNoColumn, type DataGridColumn } from '@/components/data-grid';
import { SITE_FIELDS as F } from './sites.constants';

export const buildSiteColumns = (statusLabel: (id?: string) => string): DataGridColumn<Site>[] => [
  createSrNoColumn<Site>(),
  { id: 'investigatorName', header: F.investigatorName, accessorKey: 'investigatorName', meta: { className: 'font-medium' } },
  { id: 'investigatorEmail', header: F.investigatorEmail, accessorKey: 'investigatorEmail' },
  { id: 'siteCode', header: F.siteCode, accessorKey: 'siteCode', meta: { className: 'font-semibold whitespace-nowrap' } },
  { id: 'siteName', header: F.siteName, accessorKey: 'siteName' },
  { id: 'location', header: F.location, accessorKey: 'location' },
  { id: 'expected', header: F.expectedRecruitment, accessorKey: 'expectedRecruitment', meta: { className: 'text-right' } },
  { id: 'actual', header: F.actualRecruitment, accessorKey: 'actualRecruitment', meta: { className: 'text-right' } },
  {
    id: 'status',
    header: F.statusId,
    accessorFn: (s) => statusLabel(s.statusId),
    meta: { filterVariant: 'select' },
    cell: ({ getValue }) => <span className="badge badge-soft badge-primary whitespace-nowrap">{getValue()}</span>,
  },
];
