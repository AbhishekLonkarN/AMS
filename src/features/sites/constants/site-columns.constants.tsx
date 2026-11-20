import type { Site } from '@/types';
import { createSrNoColumn, type DataGridColumn } from '@/components/data-grid';
import { SITE_FIELDS as F } from './sites.constants';

export const buildSiteColumns = (statusLabel: (id?: string) => string): DataGridColumn<Site>[] => [
  createSrNoColumn<Site>(),
  { id: 'investigatorName', header: F.investigatorName, accessorKey: 'investigatorName', meta: { className: 'font-medium sm:min-w-36' } },
  { id: 'investigatorEmail', header: F.investigatorEmail, accessorKey: 'investigatorEmail', meta: { isTruncated: true, hideBelow: 'lg' } },
  { id: 'siteCode', header: F.siteCode, accessorKey: 'siteCode', meta: { className: 'font-semibold whitespace-nowrap' } },
  { id: 'siteName', header: F.siteName, accessorKey: 'siteName', meta: { hideBelow: 'sm' } },
  { id: 'location', header: F.location, accessorKey: 'location', meta: { isTruncated: true, hideBelow: 'lg' } },
  { id: 'expected', header: F.expectedRecruitment, accessorKey: 'expectedRecruitment', meta: { className: 'text-right', hideBelow: 'lg' } },
  { id: 'actual', header: F.actualRecruitment, accessorKey: 'actualRecruitment', meta: { className: 'text-right', hideBelow: 'lg' } },
  {
    id: 'status',
    header: F.statusId,
    accessorFn: (s) => statusLabel(s.statusId),
    meta: { filterVariant: 'select' },
    cell: ({ getValue }) => <span className="badge badge-soft badge-primary whitespace-nowrap">{getValue()}</span>,
  },
];
