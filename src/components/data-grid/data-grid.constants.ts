export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;

export const DATA_GRID_LABELS = {
  search: 'Search',
  searchPlaceholder: 'Search all columns…',
  clearFilters: 'Clear',
  filterAll: 'All',
  exportExcel: 'Excel',
  exportPdf: 'PDF',
  actions: 'Actions',
  srNo: 'Sr. No.',
  rowsPerPage: 'Rows per page',
  showing: (from: number, to: number, total: number) => `Showing ${from}–${to} of ${total}`,
  pageOf: (page: number, pages: number) => `Page ${page} of ${pages}`,
  firstPage: 'First page',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  lastPage: 'Last page',
  sortBy: (column: string) => `Sort by ${column}`,
  emptyTitle: 'No records found',
  emptyDescription: 'Try clearing the search or filters.',
  status: 'Status',
} as const;
