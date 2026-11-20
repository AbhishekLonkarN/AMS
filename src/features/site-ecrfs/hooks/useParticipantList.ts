import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Participant } from '@/types';
import { notify, recordAudit, useParticipantsStore, useProjectsStore, useSitesStore } from '@/store';
import { usePermission } from '@/rbac';
import { paths } from '@/app/router/route-paths.constants';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { downloadCsv } from '@/utils/download.utils';
import { useMasterLabel } from '@/features/masters';
import { useParticipantDetailsForm } from './useParticipantDetailsForm';
import { buildParticipantColumns } from '../constants/participant-columns.constants';
import { SITE_ECRF_COLUMNS as C, SITE_ECRF_LABELS as L } from '../constants/site-ecrfs.constants';
import { furthestFormLabel } from '../utils/site-ecrfs.utils';

/** eCRFs of Site: the participants of one site. Monitors view, export and lock; they never create or delete. */
export function useParticipantList() {
  const navigate = useNavigate();
  const { projectId = '', siteId = '' } = useParams();
  const site = useSitesStore((s) => s.sites.find((x) => x.id === siteId && x.projectId === projectId));
  const participants = useParticipantsStore((s) => s.participants);
  const statusLabel = useMasterLabel();
  const canExport = usePermission('siteEcrfs.export');
  // Site users add participants and enter their data; sponsor and CO users only review it.
  const project = useProjectsStore((state) => state.projects.find((item) => item.id === projectId));
  const hasAddPermission = usePermission('siteEcrfs.new');
  const canAdd = hasAddPermission && !!project?.ecrf?.publishedAt && !project.databaseLock;
  const canEdit = usePermission('siteEcrfs.edit');
  const details = useParticipantDetailsForm({
    siteId,
    onAdded: (p) => navigate(paths.siteEcrfParticipant(projectId, siteId, p.id)),
  });

  const rows = useMemo(
    () => participants.filter((p) => p.siteId === siteId).reverse(),
    [participants, siteId],
  );
  const columns = useMemo(
    () =>
      buildParticipantColumns({
        statusLabel,
        onOpen: (p: Participant) => navigate(paths.siteEcrfParticipant(projectId, siteId, p.id)),
        canEdit,
      }),
    [statusLabel, navigate, projectId, siteId, canEdit],
  );

  const handleExport = async () => {
    const header = [C.screeningNo, C.participantNo, C.initials, C.status, C.formStatus];
    const body = rows.map((p) => [p.screeningNo, p.participantNo ?? '', p.initials, statusLabel(p.statusId), furthestFormLabel(p)]);
    const isSaved = await downloadCsv(`eCRFs-of-site-${site?.siteCode ?? 'site'}.csv`, [header, ...body]);
    if (!isSaved) {return;}
    recordAudit({
      page: AUDIT_PAGES.siteEcrfs,
      event: `Exported participant list of site ${site?.siteCode}`,
      changedTo: `${rows.length} participants`,
      projectId,
      siteId,
    });
    notify.success(L.exportName + ' exported.');
  };

  return {
    title: L.listTitle,
    description: project?.databaseLock ? 'The project database is locked. Participant records are read-only.' :
      hasAddPermission && !project?.ecrf?.publishedAt ? 'Publish the project eCRF to enable participant registration.' :
      canEdit ? L.entryListDescription(site?.siteCode ?? '') : L.listDescription(site?.siteCode ?? ''),
    emptyDescription: canEdit ? L.entryEmptyDescription : L.emptyDescription,
    canAdd,
    details,
    rows,
    columns,
    exportActions: canExport ? { onExcel: handleExport, onPdf: () => notify.phase2(L.exportName) } : undefined,
  };
}

export type ParticipantListModel = ReturnType<typeof useParticipantList>;
