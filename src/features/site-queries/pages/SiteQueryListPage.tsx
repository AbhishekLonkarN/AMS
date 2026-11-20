import { PageHeader } from '@/components/layout';
import { DataGrid } from '@/components/data-grid';
import { SITE_QUERY_LABELS as L } from '../constants/site-queries.constants';
import { useSiteQueryList } from '../hooks/useSiteQueryList';

export function SiteQueryListPage() {
  const list = useSiteQueryList();
  return (
    <div className="page-container">
      <PageHeader title={list.title} description={list.description} />
      <DataGrid
        data={list.rows}
        columns={list.columns}
        getRowId={(r) => r.id}
        searchPlaceholder={L.searchPlaceholder}
        itemLabel={L.itemLabel}
        emptyTitle={L.emptyTitle}
        emptyDescription={L.emptyDescription}
        exportActions={list.exportActions}
      />
    </div>
  );
}
