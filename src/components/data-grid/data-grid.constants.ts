/** Rows shown before the table body scrolls instead of growing. */
export const MAX_VISIBLE_ROWS = 10;

export const DATA_GRID_LABELS = {
  search: 'Search',
  searchPlaceholder: 'Search all columns…',
  filters: 'Filters',
  filtersApplied: (count: number) => `${count} filter${count === 1 ? '' : 's'} applied`,
  clearAll: 'Clear all',
  done: 'Done',
  removeFilter: (label: string) => `Remove ${label} filter`,
  filterAll: 'All',
  exportExcel: 'Excel',
  exportPdf: 'PDF',
  actions: 'Actions',
  sortAsc: 'Sort ascending',
  sortDesc: 'Sort descending',
  sortClear: 'Remove sorting',
  srNo: 'Sr. No.',
  emptyTitle: 'No records found',
  emptyDescription: 'Try clearing the search or filters.',
  status: 'Status',
} as const;

/**
 * `hideBelow` -> classes. Written out in full so Tailwind can see them.
 * The column is hidden below the breakpoint and shown as a table cell from it.
 */
export const HIDE_BELOW_CLASS = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
} as const;
