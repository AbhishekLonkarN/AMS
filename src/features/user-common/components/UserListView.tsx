import { Link } from 'react-router-dom';
import { ChevronDown, Plus } from 'lucide-react';
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
  /** A "Create" button that opens a menu (e.g. one entry per user type). Used instead of `createTo`. */
  createMenu?: { label: string; options: { key: string; label: string; to: string }[] };
  columns: DataGridColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  rowActions: (row: T) => RowAction[];
  isRowMuted?: (row: T) => boolean;
  exportActions?: DataGridExport;
  searchPlaceholder?: string;
  /** Rows are called this in the pagination summary (default "records"). */
  itemLabel?: string;
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
  createMenu,
  columns,
  data,
  getRowId,
  rowActions,
  isRowMuted,
  exportActions,
  searchPlaceholder,
  itemLabel,
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
        itemLabel={itemLabel}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        toolbarActions={
          createMenu ? (
            <div className="dropdown dropdown-end">
              <button type="button" tabIndex={0} className="btn btn-primary btn-sm">
                <Plus className="size-4" aria-hidden /> {createMenu.label}
                <ChevronDown className="size-4" aria-hidden />
              </button>
              <ul
                tabIndex={0}
                className="dropdown-content menu z-(--z-dropdown) mt-1 w-44 rounded-control border border-base-300 bg-base-100 p-1 shadow-raised"
              >
                {createMenu.options.map((option) => (
                  <li key={option.key}>
                    <Link to={option.to} onClick={() => (document.activeElement as HTMLElement | null)?.blur()}>
                      {option.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            createLabel &&
            createTo && (
              <Link to={createTo} className="btn btn-primary btn-sm">
                <Plus className="size-4" aria-hidden /> {createLabel}
              </Link>
            )
          )
        }
      />
      {confirm && <ConfirmDialog {...confirm} />}
    </div>
  );
}
