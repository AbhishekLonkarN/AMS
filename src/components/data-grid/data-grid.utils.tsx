import { StatusBadge, type StatusKind } from '@/components/feedback';
import { STATUS_BADGE_LABELS } from '@/components/feedback/feedback.constants';
import type { DataGridColumn } from './data-grid.types';
import { DATA_GRID_LABELS } from './data-grid.constants';

/** "Sr. No." numbered by the current sort/filter/page. */
export function createSrNoColumn<T>(header: string = DATA_GRID_LABELS.srNo): DataGridColumn<T> {
  return {
    id: 'srNo',
    header,
    enableSorting: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    meta: { filterVariant: 'none', className: 'w-16' },
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      return table.getRowModel().rows.findIndex((r) => r.id === row.id) + 1 + pageIndex * pageSize;
    },
  };
}

/** Status column: filters/sorts on the label, renders a badge (icon + text). */
export function createStatusColumn<T>(
  getStatus: (row: T) => StatusKind,
  header: string = DATA_GRID_LABELS.status,
): DataGridColumn<T> {
  return {
    id: 'status',
    header,
    accessorFn: (row) => STATUS_BADGE_LABELS[getStatus(row)],
    meta: { filterVariant: 'select', className: 'w-36' },
    cell: ({ row }) => <StatusBadge status={getStatus(row.original)} size="sm" />,
  };
}
