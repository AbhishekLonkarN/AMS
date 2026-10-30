import type { Project } from '@/types';
import { createSrNoColumn, type DataGridColumn } from '@/components/data-grid';
import { PROJECT_FIELDS as F } from './projects.constants';

interface ProjectColumnLookups {
  statusLabel: (id?: string) => string;
  userName: (id?: string) => string;
}

export const buildProjectColumns = ({ statusLabel, userName }: ProjectColumnLookups): DataGridColumn<Project>[] => [
  createSrNoColumn<Project>(),
  { id: 'name', header: F.name, accessorKey: 'name', meta: { className: 'font-semibold' } },
  { id: 'testProduct', header: F.testProduct, accessorKey: 'testProduct' },
  { id: 'description', header: F.description, accessorKey: 'description', meta: { className: 'max-w-xs truncate' } },
  { id: 'sponsor', header: F.sponsor, accessorKey: 'sponsor', meta: { filterVariant: 'select' } },
  {
    id: 'status',
    header: F.statusId,
    accessorFn: (p) => statusLabel(p.statusId),
    meta: { filterVariant: 'select' },
    cell: ({ getValue }) => <span className="badge badge-soft badge-primary whitespace-nowrap">{getValue()}</span>,
  },
  { id: 'projectManager', header: F.projectManagerId, accessorFn: (p) => userName(p.projectManagerId) },
];
