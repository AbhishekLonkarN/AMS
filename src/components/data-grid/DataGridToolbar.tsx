import type { ReactNode } from 'react';
import { FileSpreadsheet, FileText, Search, X } from 'lucide-react';
import clsx from 'clsx';
import type { DataGridExport, ToolbarSelectFilter } from './data-grid.types';
import { DATA_GRID_LABELS } from './data-grid.constants';
import { DataGridFilters } from './DataGridFilters';
import styles from './DataGrid.module.css';

interface DataGridToolbarProps {
  search: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  /** One dropdown per `select` column, inside the Filters popover. */
  filters: ToolbarSelectFilter[];
  onFilterChange: (id: string, value: string | undefined) => void;
  onClearFilters: () => void;
  exportActions?: DataGridExport;
  actions?: ReactNode;
}

/** Search (all text columns) + Filters popover + export + page actions; active filters show as chips below. */
export function DataGridToolbar({
  search,
  searchPlaceholder,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters,
  exportActions,
  actions,
}: DataGridToolbarProps) {
  const activeFilters = filters.filter((filter) => filter.value);

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

      {filters.length > 0 && (
        <DataGridFilters
          filters={filters}
          activeCount={activeFilters.length}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
        />
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

      {activeFilters.length > 0 && (
        <div className={styles.chips}>
          {activeFilters.map((filter) => (
            <span key={filter.id} className={styles.chip}>
              <span className={styles.chipLabel}>{filter.label}:</span> {filter.value}
              <button
                type="button"
                className={styles.chipRemove}
                aria-label={DATA_GRID_LABELS.removeFilter(filter.label)}
                onClick={() => onFilterChange(filter.id, undefined)}
              >
                <X className="size-3" aria-hidden />
              </button>
            </span>
          ))}
          <button type="button" className="btn btn-link btn-xs" onClick={onClearFilters}>
            {DATA_GRID_LABELS.clearAll}
          </button>
        </div>
      )}
    </div>
  );
}
