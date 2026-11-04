import { PageHeader } from '@/components/layout';
import { DataGrid } from '@/components/data-grid';
import type { AuditTrailModel } from '../hooks/useAuditTrail';

export function AuditTrailView({
  title,
  description,
  rows,
  columns,
  getRowId,
  pageSize,
  searchPlaceholder,
  emptyTitle,
  emptyDescription,
}: AuditTrailModel) {
  return (
    <div className="page-container">
      <PageHeader title={title} description={description} />
      <DataGrid
        data={rows}
        columns={columns}
        getRowId={getRowId}
        initialPageSize={pageSize}
        itemLabel="entries"
        searchPlaceholder={searchPlaceholder}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
    </div>
  );
}
