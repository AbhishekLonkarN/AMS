/** Rows-per-page choices offered by every paginated list in the app. */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 10;

export const PAGINATION_LABELS = {
  navigation: 'Pagination',
  /** "1–10 of 150 users" */
  summary: (from: number, to: number, total: number, itemLabel: string) => `${from}–${to} of ${total} ${itemLabel}`,
  defaultItemLabel: 'records',
  rowsPerPage: 'Rows per page',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  goToPage: (page: number) => `Page ${page}`,
} as const;
