import { PageHeader } from '@/components/layout';
import { DataGrid } from '@/components/data-grid';
import type { ProjectExportModel } from '../hooks/useProjectExport';

export function ProjectExportView({
  title,
  description,
  columns,
  data,
  getRowId,
  searchPlaceholder,
  emptyTitle,
  emptyDescription,
  itemLabel,
}: ProjectExportModel) {
  return (
    <div className="page-container">
      <PageHeader title={title} description={description} />
      <DataGrid
        data={data}
        columns={columns}
        getRowId={getRowId}
        searchPlaceholder={searchPlaceholder}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        itemLabel={itemLabel}
      />
    </div>
  );
}
