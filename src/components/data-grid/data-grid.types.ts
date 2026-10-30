import type { ReactNode } from 'react';
import type { ColumnDef, RowData, SortingState } from '@tanstack/react-table';
import type { LucideIcon } from 'lucide-react';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    /**
     * How the toolbar filters this column:
     * - `text` (default): covered by the single search box;
     * - `select`: its own dropdown in the toolbar row, options built from the column's values;
     * - `none`: not filterable.
     */
    filterVariant?: 'text' | 'select' | 'none';
    /** Extra classes for header + cells (e.g. width, alignment). */
    className?: string;
  }
}

export type DataGridColumn<T> = ColumnDef<T, any>;

/** A dropdown filter shown in the toolbar row. */
export interface ToolbarSelectFilter {
  id: string;
  label: string;
  value: string;
  options: string[];
}

export interface RowAction {
  key: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  tone?: 'default' | 'danger';
}

export interface DataGridExport {
  onExcel: () => void;
  onPdf: () => void;
}

export interface DataGridProps<T> {
  data: T[];
  columns: DataGridColumn<T>[];
  getRowId?: (row: T) => string;
  /** Row actions (already permission-filtered by the caller). */
  rowActions?: (row: T) => RowAction[];
  searchPlaceholder?: string;
  /** Primary actions in the toolbar (e.g. "+ Add"). */
  toolbarActions?: ReactNode;
  /** Pass only when the user has the export permission. */
  exportActions?: DataGridExport;
  emptyTitle?: string;
  emptyDescription?: string;
  initialPageSize?: number;
  initialSorting?: SortingState;
  /** Rows to show de-emphasised (e.g. In-active / Deaffiliated records). */
  isRowMuted?: (row: T) => boolean;
}
