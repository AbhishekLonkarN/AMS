import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { DataGrid, type DataGridColumn, type DataGridExport, type RowAction } from '@/components/data-grid';
import { ConfirmDialog } from '@/components/feedback';
import type { StatusToggleConfirm } from '../hooks/useUserStatusToggle';

interface UserListViewProps<T> {
  title: string;
  description?: string;
  backTo?: string;
  /** Omit when the user lacks the `new` / `affiliate` right. */
  createLabel?: string;
  createTo?: string;
  columns: DataGridColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  rowActions: (row: T) => RowAction[];
  isRowMuted?: (row: T) => boolean;
  exportActions?: DataGridExport;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Deactivate / Deaffiliate confirm dialog, when the list has one. */
  confirm?: StatusToggleConfirm;
}

/** Page header + DataGrid (+ confirm dialog). Shared by user, affiliation, project and site lists. */
export function UserListView<T>({
  title,
  description,
  backTo,
  createLabel,
  createTo,
  columns,
  data,
  getRowId,
  rowActions,
  isRowMuted,
  exportActions,
  searchPlaceholder,
  emptyTitle,
  emptyDescription,
  confirm,
}: UserListViewProps<T>) {
  return (
    <div className="page-container">
      <PageHeader title={title} description={description} backTo={backTo} />
      <DataGrid
        data={data}
        columns={columns}
        getRowId={getRowId}
        rowActions={rowActions}
        isRowMuted={isRowMuted}
        exportActions={exportActions}
        searchPlaceholder={searchPlaceholder}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        toolbarActions={
          createLabel &&
          createTo && (
            <Link to={createTo} className="btn btn-primary btn-sm">
              <Plus className="size-4" aria-hidden /> {createLabel}
            </Link>
          )
        }
      />
      {confirm && <ConfirmDialog {...confirm} />}
    </div>
  );
}
