import { useId } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { DropdownSelect } from '@/components/form';
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
  const sizeLabelId = useId();
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

      <div className={styles.size}>
        <span id={sizeLabelId}>{L.rowsPerPage}</span>
        <DropdownSelect
          size="sm"
          className={styles.sizeSelect}
          labelledBy={sizeLabelId}
          value={String(pageSize)}
          options={pageSizeOptions.map((size) => ({ value: String(size), label: String(size) }))}
          onChange={(value) => onPageSizeChange(Number(value))}
        />
      </div>
    </div>
  );
}
