import type { ReactNode } from 'react';
import { FileSpreadsheet, FileText, FilterX, Search } from 'lucide-react';
import clsx from 'clsx';
import type { DataGridExport, ToolbarSelectFilter } from './data-grid.types';
import { DATA_GRID_LABELS } from './data-grid.constants';
import styles from './DataGrid.module.css';

interface DataGridToolbarProps {
  search: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  /** One dropdown per `select` column, in the same row as the search box. */
  filters: ToolbarSelectFilter[];
  onFilterChange: (id: string, value: string | undefined) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  exportActions?: DataGridExport;
  actions?: ReactNode;
}

/** One row: search (all text columns) + a dropdown per select column + export + page actions. */
export function DataGridToolbar({
  search,
  searchPlaceholder,
  onSearchChange,
  filters,
  onFilterChange,
  hasActiveFilters,
  onClearFilters,
  exportActions,
  actions,
}: DataGridToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <label className={clsx('input input-sm', styles.search)}>
        <Search className="size-4 text-ink-400" aria-hidden />
        <span className="sr-only">{DATA_GRID_LABELS.search}</span>
        <input
          type="search"
          className="grow"
          value={search}
          placeholder={searchPlaceholder}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </label>

      {filters.map((filter) => (
        <label key={filter.id} className={clsx('select select-sm', styles.selectFilter, filter.value && styles.active)}>
          <span className="label">{filter.label}</span>
          <select value={filter.value} onChange={(e) => onFilterChange(filter.id, e.target.value || undefined)}>
            <option value="">{DATA_GRID_LABELS.filterAll}</option>
            {filter.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ))}

      {hasActiveFilters && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClearFilters}>
          <FilterX className="size-4" aria-hidden /> {DATA_GRID_LABELS.clearFilters}
        </button>
      )}

      <div className={styles.toolbarEnd}>
        {exportActions && (
          <div className="join">
            <button type="button" className="btn btn-sm join-item" onClick={exportActions.onExcel}>
              <FileSpreadsheet className="size-4 text-success" aria-hidden /> {DATA_GRID_LABELS.exportExcel}
            </button>
            <button type="button" className="btn btn-sm join-item" onClick={exportActions.onPdf}>
              <FileText className="size-4 text-error" aria-hidden /> {DATA_GRID_LABELS.exportPdf}
            </button>
          </div>
        )}
        {actions}
      </div>
    </div>
  );
}
