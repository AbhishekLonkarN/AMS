import { Download } from 'lucide-react';
import type { Project } from '@/types';
import { createSrNoColumn, type DataGridColumn } from '@/components/data-grid';
import { PROJECT_EXPORT_COLUMN_LABELS as C, PROJECT_EXPORT_LABELS as L } from './project-export.constants';

interface ProjectExportColumnOptions {
  userName: (id?: string) => string;
  onExport: (project: Project) => void;
}

export const buildProjectExportColumns = ({ userName, onExport }: ProjectExportColumnOptions): DataGridColumn<Project>[] => [
  createSrNoColumn<Project>(),
  { id: 'name', header: C.name, accessorKey: 'name', meta: { className: 'font-semibold' } },
  { id: 'testProduct', header: C.testProduct, accessorKey: 'testProduct' },
  { id: 'description', header: C.description, accessorKey: 'description', meta: { className: 'max-w-xs truncate' } },
  { id: 'sponsor', header: C.sponsor, accessorKey: 'sponsor', meta: { filterVariant: 'select' } },
  { id: 'projectManager', header: C.projectManager, accessorFn: (p) => userName(p.projectManagerId) },
  {
    id: 'action',
    header: C.action,
    enableSorting: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    meta: { filterVariant: 'none', className: 'w-32' },
    cell: ({ row }) => (
      <button
        type="button"
        className="btn btn-sm border-primary bg-ink-100 text-primary hover:bg-brand-50"
        aria-label={L.exportAria(row.original.name)}
        onClick={() => onExport(row.original)}
      >
        <Download className="size-4" aria-hidden /> {L.exportButton}
      </button>
    ),
  },
];
