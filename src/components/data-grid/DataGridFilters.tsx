import { useId } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import clsx from 'clsx';
import { DropdownSelect } from '@/components/form';
import { Popover } from '@/components/overlay';
import type { ToolbarSelectFilter } from './data-grid.types';
import { DATA_GRID_LABELS } from './data-grid.constants';
import styles from './DataGrid.module.css';

interface DataGridFiltersProps {
  filters: ToolbarSelectFilter[];
  activeCount: number;
  onFilterChange: (id: string, value: string | undefined) => void;
  onClearFilters: () => void;
}

/** "Filters" button with a count badge; opens a popover with one dropdown per select column. Changes apply live. */
export function DataGridFilters({ filters, activeCount, onFilterChange, onClearFilters }: DataGridFiltersProps) {
  const idPrefix = useId();
  return (
    <Popover
      placement="bottom-start"
      trigger={
        <button
          type="button"
          className={clsx('btn btn-sm', activeCount > 0 && styles.filterButtonActive)}
          aria-label={activeCount > 0 ? DATA_GRID_LABELS.filtersApplied(activeCount) : DATA_GRID_LABELS.filters}
        >
          <SlidersHorizontal className="size-4" aria-hidden /> {DATA_GRID_LABELS.filters}
          {activeCount > 0 && <span className="badge badge-primary badge-xs">{activeCount}</span>}
        </button>
      }
    >
      {(close) => (
        <div className={styles.filterPanel}>
          <div className={styles.filterPanelHeader}>
            <span className={styles.filterPanelTitle}>{DATA_GRID_LABELS.filters}</span>
            {activeCount > 0 && (
              <button type="button" className="btn btn-link btn-xs" onClick={onClearFilters}>
                {DATA_GRID_LABELS.clearAll}
              </button>
            )}
          </div>

          <div className={styles.filterFields}>
            {filters.map((filter) => {
              const labelId = `${idPrefix}-${filter.id}`;
              return (
                <div key={filter.id} className={styles.filterField}>
                  <span id={labelId} className={styles.filterLabel}>
                    {filter.label}
                  </span>
                  <DropdownSelect
                    size="sm"
                    isValueHighlighted
                    labelledBy={labelId}
                    value={filter.value}
                    options={filter.options.map((option) => ({ value: option, label: option }))}
                    emptyLabel={DATA_GRID_LABELS.filterAll}
                    onChange={(value) => onFilterChange(filter.id, value || undefined)}
                  />
                </div>
              );
            })}
          </div>

          <button type="button" className="btn btn-primary btn-sm btn-block shrink-0" onClick={close}>
            {DATA_GRID_LABELS.done}
          </button>
        </div>
      )}
    </Popover>
  );
}
