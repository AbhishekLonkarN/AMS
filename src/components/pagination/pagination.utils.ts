/** A page number (1-based) or a gap shown as "•••". */
export type PageItem = number | 'gap-start' | 'gap-end';

/**
 * Which page buttons to show, e.g. `1 2 3 4 5 ••• 15` or `1 ••• 7 8 9 ••• 15`.
 * Always the first and last page, the current page and its neighbours; at most 7 slots.
 */
export function getPageItems(pageIndex: number, pageCount: number): PageItem[] {
  const current = pageIndex + 1;
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);

  if (current <= 4) return [1, 2, 3, 4, 5, 'gap-end', pageCount];
  if (current >= pageCount - 3) return [1, 'gap-start', ...Array.from({ length: 5 }, (_, i) => pageCount - 4 + i)];
  return [1, 'gap-start', current - 1, current, current + 1, 'gap-end', pageCount];
}
