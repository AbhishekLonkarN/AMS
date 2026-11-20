import { Link, useParams } from 'react-router-dom';
import { paths } from '@/app/router/route-paths.constants';
import { DataGrid, type DataGridColumn } from '@/components/data-grid';
import { PageHeader } from '@/components/layout';
import { QUERY_STATUS_LABELS } from '@/features/site-ecrfs';
import { can, useAccessibleSites, useCurrentPrincipal } from '@/rbac';
import { notify, recordAudit, useParticipantsStore, useQueriesStore } from '@/store';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { downloadCsv } from '@/utils/download.utils';
import { clinicalForms } from './project-ecrf.utils';

export function ProjectQueriesPage() {
  const { projectId = '' } = useParams();
  const principal = useCurrentPrincipal();
  const sites = useAccessibleSites(projectId);
  const queries = useQueriesStore((state) => state.queries);
  const participants = useParticipantsStore((state) => state.participants);
  const siteById = new Map(sites.map((site) => [site.id, site]));
  const participantById = new Map(participants.filter((p) => p.projectId === projectId).map((p) => [p.id, p]));
  const rows = queries.filter((query) => query.projectId === projectId && siteById.has(query.siteId)).map((query) => {
    const participant = participantById.get(query.participantId);
    const form = clinicalForms(participant?.ecrfDesign).find((definition) => definition.key === query.formKey);
    const scope = { type: 'site' as const, projectId, siteId: query.siteId };
    return {
      ...query,
      site: siteById.get(query.siteId)?.siteCode ?? '',
      screening: participant?.screeningNo ?? '',
      formTitle: form?.label ?? query.formKey,
      fieldTitle: form?.fields.find((field) => field.key === query.fieldKey)?.label ?? query.fieldKey,
      statusLabel: QUERY_STATUS_LABELS[query.status],
      canView: can(principal, 'siteEcrfQuery.view', scope),
      to: can(principal, 'siteEcrfs.view', scope)
        ? `${paths.siteEcrfParticipant(projectId, query.siteId, query.participantId)}?${new URLSearchParams({ form: query.formKey, field: query.fieldKey })}`
        : undefined,
    };
  });
  const columns: DataGridColumn<(typeof rows)[number]>[] = [
    { accessorKey: 'site', header: 'Site ID', meta: { filterVariant: 'select' } },
    { accessorKey: 'screening', header: 'Screening ID' },
    { accessorKey: 'formTitle', header: 'Form' },
    { accessorKey: 'fieldTitle', header: 'Data field' },
    { accessorKey: 'statusLabel', header: 'Status', meta: { filterVariant: 'select' } },
    { accessorKey: 'text', header: 'Query', meta: { isTruncated: true } },
    { id: 'open', header: 'Action', cell: ({ row }) => row.original.to ? <Link to={row.original.to} className="btn btn-ghost btn-sm">Open query</Link> : null },
  ];
  const visible = rows.filter((row) => row.canView);
  const exportQueries = async () => {
    if (!(await downloadCsv('project-queries.csv', [
      ['Site ID', 'Screening ID', 'Form', 'Data field', 'Status', 'Query', 'Response'],
      ...rows.map((row) => [row.site, row.screening, row.formTitle, row.fieldTitle, row.statusLabel, row.text, row.response]),
    ]))) return;
    recordAudit({ page: AUDIT_PAGES.siteQueries, projectId, event: 'Exported project queries (CSV)', changedTo: `${rows.length} queries, all permitted sites` });
    notify.success('Project queries exported.');
  };

  return (
    <div className="page-container">
      <PageHeader title="Project Queries" backTo={paths.projectHub(projectId)}
        actions={<button type="button" className="btn btn-primary" onClick={() => void exportQueries()}>Export all project queries (CSV)</button>} />
      <DataGrid data={visible} columns={columns} getRowId={(row) => row.id} searchPlaceholder="Find a query"
        emptyTitle="No queries to view" emptyDescription="Queries from sites you can view will appear here." />
    </div>
  );
}
