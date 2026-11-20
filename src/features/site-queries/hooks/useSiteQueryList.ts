import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { notify, recordAudit, useParticipantsStore, useQueriesStore, useSitesStore } from '@/store';
import { usePermission } from '@/rbac';
import { paths } from '@/app/router/route-paths.constants';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { clinicalForms } from '@/features/project-workflows/project-ecrf.utils';
import { downloadCsv } from '@/utils/download.utils';
import { QUERY_STATUS_LABELS } from '@/features/site-ecrfs';
import {
  SITE_QUERY_COLUMNS as C,
  SITE_QUERY_LABELS as L,
  buildSiteQueryColumns,
  type SiteQueryRow,
} from '../constants/site-queries.constants';

/** Queries on eCRFs of Site: every query of one site, openable in context and exportable. */
export function useSiteQueryList() {
  const navigate = useNavigate();
  const { projectId = '', siteId = '' } = useParams();
  const site = useSitesStore((s) => s.sites.find((x) => x.id === siteId && x.projectId === projectId));
  const queries = useQueriesStore((s) => s.queries);
  const participants = useParticipantsStore((s) => s.participants);
  const canExport = usePermission('siteQueriesAll.export');
  const canOpen = usePermission('siteEcrfs.view');

  const rows = useMemo<SiteQueryRow[]>(
    () =>
      queries
        .filter((q) => q.siteId === siteId)
        .map((q) => {
          const participant = participants.find((p) => p.id === q.participantId);
          const form = clinicalForms(participant?.ecrfDesign).find((definition) => definition.key === q.formKey);
          return {
            id: q.id,
            participantId: q.participantId,
            screeningNo: participant?.screeningNo ?? '',
            participantNo: participant?.participantNo ?? '',
            initials: participant?.initials ?? '',
            formKey: q.formKey,
            fieldKey: q.fieldKey,
            formTitle: form?.label ?? q.formKey,
            dataField: form?.fields.find((f) => f.key === q.fieldKey)?.label ?? q.fieldKey,
            query: q.text,
            response: q.response ?? '',
            status: q.status,
          };
        })
        .reverse(),
    [queries, participants, siteId],
  );

  const columns = useMemo(
    () =>
      buildSiteQueryColumns(
        canOpen
          ? (row) => navigate(`${paths.siteEcrfParticipant(projectId, siteId, row.participantId)}?form=${row.formKey}&field=${row.fieldKey}`)
          : undefined,
      ),
    [canOpen, navigate, projectId, siteId],
  );

  const handleExport = async () => {
    const header = [C.screeningNo, C.participantNo, C.initials, C.formTitle, C.dataField, C.query, C.response, C.status];
    const body = rows.map((r) => [r.screeningNo, r.participantNo, r.initials, r.formTitle, r.dataField, r.query, r.response, QUERY_STATUS_LABELS[r.status]]);
    const isSaved = await downloadCsv(`queries-of-site-${site?.siteCode ?? 'site'}.csv`, [header, ...body]);
    if (!isSaved) {return;}
    recordAudit({
      page: AUDIT_PAGES.siteQueries,
      event: `Exported queries of site ${site?.siteCode}`,
      changedTo: `${rows.length} queries`,
      projectId,
      siteId,
    });
    notify.success(`${L.exportName} exported.`);
  };

  return {
    title: L.title,
    description: L.description(site?.siteCode ?? ''),
    rows,
    columns,
    exportActions: canExport ? { onExcel: handleExport, onPdf: () => notify.phase2(L.exportName) } : undefined,
  };
}
