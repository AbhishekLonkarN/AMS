import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { PAGE_SIZE_OPTIONS, PAGINATION_LABELS as L } from './pagination.constants';
import { getPageItems } from './pagination.utils';
import styles from './Pagination.module.css';

export interface PaginationProps {
  /** Zero-based index of the current page. */
  pageIndex: number;
  pageCount: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  /** Rows-per-page choices; defaults to 10 / 20 / 50 / 100. */
  pageSizeOptions?: readonly number[];
  /** What the rows are called in the summary, e.g. "users" -> "1–10 of 150 users". */
  itemLabel?: string;
}

/**
 * Reusable pagination bar: "1–10 of 150 users", numbered pages with previous / next, and a rows-per-page
 * dropdown. Controlled and presentation-only, so any list or table can use it.
 */
export function Pagination({
  pageIndex,
  pageCount,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  itemLabel = L.defaultItemLabel,
}: PaginationProps) {
  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min(totalRows, (pageIndex + 1) * pageSize);
  const lastIndex = Math.max(0, pageCount - 1);
  const items = getPageItems(pageIndex, Math.max(1, pageCount));

  return (
    <div className={styles.bar}>
      <div className={styles.start}>
        <span className={styles.summary}>{L.summary(from, to, totalRows, itemLabel)}</span>

        <nav className={styles.pages} aria-label={L.navigation}>
          <button
            type="button"
            className={styles.step}
            disabled={pageIndex <= 0}
            aria-label={L.previousPage}
            onClick={() => onPageChange(pageIndex - 1)}
          >
            <ChevronLeft className="size-3.5" aria-hidden />
          </button>

          {items.map((item) =>
            typeof item === 'number' ? (
              <button
                key={item}
                type="button"
                className={clsx(styles.page, item === pageIndex + 1 && styles.pageActive)}
                aria-label={L.goToPage(item)}
                aria-current={item === pageIndex + 1 ? 'page' : undefined}
                onClick={() => onPageChange(item - 1)}
              >
                {item}
              </button>
            ) : (
              <span key={item} className={styles.gap} aria-hidden>
                •••
              </span>
            ),
          )}

          <button
            type="button"
            className={styles.step}
            disabled={pageIndex >= lastIndex}
            aria-label={L.nextPage}
            onClick={() => onPageChange(pageIndex + 1)}
          >
            <ChevronRight className="size-3.5" aria-hidden />
          </button>
        </nav>
      </div>

      <label className={styles.size}>
        {L.rowsPerPage}
        <select
          className="select select-sm h-7 min-h-0 w-[4.5rem] text-label"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
