import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import clsx from 'clsx';
import { EmptyState } from '@/components/feedback';
import { Tooltip } from '@/components/overlay';
import type { DataGridColumn, DataGridProps, ToolbarSelectFilter } from './data-grid.types';
import { DATA_GRID_LABELS, DEFAULT_PAGE_SIZE } from './data-grid.constants';
import { DataGridToolbar } from './DataGridToolbar';
import { DataGridPagination } from './DataGridPagination';
import styles from './DataGrid.module.css';

const ACTIONS_COLUMN_ID = '__actions';

/**
 * Select columns filter by exact value via their toolbar dropdown and stay out of
 * the search box, which covers the text columns. Recurses into column groups.
 */
function withFilterFns<T>(columns: DataGridColumn<T>[]): DataGridColumn<T>[] {
  return columns.map((c) => {
    const group = c as DataGridColumn<T> & { columns?: DataGridColumn<T>[] };
    if (group.columns) return { ...group, columns: withFilterFns(group.columns) } as DataGridColumn<T>;
    if (c.meta?.filterVariant === 'select') return { ...c, filterFn: 'equalsString' as const, enableGlobalFilter: false };
    return c;
  });
}

/** Generic list grid: one-row toolbar (search + dropdown filters), sort, pagination, export, row actions. */
export function DataGrid<T>({
  data,
  columns,
  getRowId,
  rowActions,
  searchPlaceholder = DATA_GRID_LABELS.searchPlaceholder,
  toolbarActions,
  exportActions,
  emptyTitle = DATA_GRID_LABELS.emptyTitle,
  emptyDescription = DATA_GRID_LABELS.emptyDescription,
  initialPageSize = DEFAULT_PAGE_SIZE,
  initialSorting = [],
  isRowMuted,
}: DataGridProps<T>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: initialPageSize });

  const allColumns = useMemo<DataGridColumn<T>[]>(() => {
    const prepared = withFilterFns(columns);
    if (!rowActions) return prepared;
    return [
      ...prepared,
      {
        id: ACTIONS_COLUMN_ID,
        header: DATA_GRID_LABELS.actions,
        enableSorting: false,
        enableColumnFilter: false,
        enableGlobalFilter: false,
        meta: { filterVariant: 'none', className: 'w-px text-right' },
        cell: ({ row }) => (
          <div className={styles.rowActions}>
            {rowActions(row.original).map((action) => {
              const Icon = action.icon;
              return (
                <Tooltip key={action.key} content={action.label}>
                  <button
                    type="button"
                    className={clsx('btn btn-ghost btn-xs btn-square', action.tone === 'danger' && 'text-error')}
                    aria-label={action.label}
                    onClick={action.onClick}
                  >
                    <Icon className="size-4" aria-hidden />
                  </button>
                </Tooltip>
              );
            })}
          </div>
        ),
      },
    ];
  }, [columns, rowActions]);

  const table = useReactTable({
    data,
    columns: allColumns,
    getRowId,
    state: { sorting, columnFilters, globalFilter, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn: 'includesString',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  const rows = table.getRowModel().rows;
  const totalRows = table.getFilteredRowModel().rows.length;
  // A dropdown in the toolbar for every `select` column, in column order.
  const selectFilters: ToolbarSelectFilter[] = table
    .getAllLeafColumns()
    .filter((column) => column.columnDef.meta?.filterVariant === 'select')
    .map((column) => ({
      id: column.id,
      label: typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id,
      value: (column.getFilterValue() as string) ?? '',
      options: [...column.getFacetedUniqueValues().keys()].filter(Boolean).map(String).sort(),
    }));

  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const handleClearFilters = () => {
    setColumnFilters([]);
    setGlobalFilter('');
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  return (
    <div className={styles.card}>
      <DataGridToolbar
        search={globalFilter}
        searchPlaceholder={searchPlaceholder}
        onSearchChange={handleSearchChange}
        filters={selectFilters}
        onFilterChange={(id, value) => table.getColumn(id)?.setFilterValue(value)}
        hasActiveFilters={columnFilters.length > 0 || globalFilter !== ''}
        onClearFilters={handleClearFilters}
        exportActions={exportActions}
        actions={toolbarActions}
      />

      <div className={styles.scroll}>
        <table className={clsx('table', styles.table)}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.getCanSort() && !header.isPlaceholder && header.subHeaders.length === 0;
                  const sortDir = header.column.getIsSorted();
                  const SortIcon = sortDir === 'asc' ? ArrowUp : sortDir === 'desc' ? ArrowDown : ArrowUpDown;
                  const content = header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext());
                  const isGroup = header.subHeaders.length > 0;
                  const thClassName = clsx(styles.th, isGroup && styles.groupTh, header.column.columnDef.meta?.className);
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className={thClassName}
                      aria-sort={sortDir === 'asc' ? 'ascending' : sortDir === 'desc' ? 'descending' : undefined}
                    >
                      {isSortable ? (
                        <button type="button" className={styles.sortButton} onClick={header.column.getToggleSortingHandler()}>
                          {content}
                          <SortIcon className={clsx(styles.sortIcon, sortDir && styles.sortIconActive)} aria-hidden />
                        </button>
                      ) : (
                        content
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={clsx(styles.row, isRowMuted?.(row.original) && styles.mutedRow)}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={clsx(styles.td, cell.column.columnDef.meta?.className)}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <EmptyState title={emptyTitle} description={emptyDescription} />}
      </div>

      <DataGridPagination
        pageIndex={pagination.pageIndex}
        pageCount={table.getPageCount()}
        pageSize={pagination.pageSize}
        totalRows={totalRows}
        onPageChange={(pageIndex) => setPagination((p) => ({ ...p, pageIndex }))}
        onPageSizeChange={(pageSize) => setPagination({ pageIndex: 0, pageSize })}
      />
    </div>
  );
}
