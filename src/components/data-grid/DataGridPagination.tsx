import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { DATA_GRID_LABELS, PAGE_SIZE_OPTIONS } from './data-grid.constants';
import styles from './DataGrid.module.css';

interface DataGridPaginationProps {
  pageIndex: number;
  pageCount: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function DataGridPagination({
  pageIndex,
  pageCount,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
}: DataGridPaginationProps) {
  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min(totalRows, (pageIndex + 1) * pageSize);
  const lastIndex = Math.max(0, pageCount - 1);
  const isFirst = pageIndex <= 0;
  const isLast = pageIndex >= lastIndex;

  return (
    <div className={styles.pagination}>
      <span className="text-label text-ink-500">{DATA_GRID_LABELS.showing(from, to, totalRows)}</span>

      <div className={styles.paginationEnd}>
        <label className="flex items-center gap-2 text-label text-ink-500">
          {DATA_GRID_LABELS.rowsPerPage}
          <select
            className="select select-sm w-20"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <span className="text-label text-ink-500">{DATA_GRID_LABELS.pageOf(pageIndex + 1, Math.max(1, pageCount))}</span>

        <div className="join">
          <button type="button" className="btn btn-sm join-item" disabled={isFirst} aria-label={DATA_GRID_LABELS.firstPage} onClick={() => onPageChange(0)}>
            <ChevronsLeft className="size-4" aria-hidden />
          </button>
          <button type="button" className="btn btn-sm join-item" disabled={isFirst} aria-label={DATA_GRID_LABELS.previousPage} onClick={() => onPageChange(pageIndex - 1)}>
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button type="button" className="btn btn-sm join-item" disabled={isLast} aria-label={DATA_GRID_LABELS.nextPage} onClick={() => onPageChange(pageIndex + 1)}>
            <ChevronRight className="size-4" aria-hidden />
          </button>
          <button type="button" className="btn btn-sm join-item" disabled={isLast} aria-label={DATA_GRID_LABELS.lastPage} onClick={() => onPageChange(lastIndex)}>
            <ChevronsRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
