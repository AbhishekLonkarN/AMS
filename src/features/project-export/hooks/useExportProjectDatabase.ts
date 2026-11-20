import { countSiteEnrolment } from '@/utils/participant.utils';
import { useMemo } from 'react';
import type { Project } from '@/types';
import { notify, recordAudit, useParticipantsStore, useQueriesStore, useSitesStore, useUsersStore } from '@/store';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { downloadCsv } from '@/utils/download.utils';
import { useMasterLabel } from '@/features/masters';
import { userNameById } from '@/features/user-common';
import { PROJECT_EXPORT_LABELS as L } from '../constants/project-export.constants';
import { clinicalExportRows } from '@/features/project-workflows/clinical-export.utils';
import { can, useCurrentPrincipal } from '@/rbac';
import { projectDatabaseRows, projectExportFilename } from '../utils/project-export.utils';

/** Returns a function that downloads one project's database as a file. Shared by the export list and the project hub. */
export function useExportProjectDatabase() {
  const principal = useCurrentPrincipal();
  const sites = useSitesStore((s) => s.sites);
  const users = useUsersStore((s) => s.users);
  const statusLabel = useMasterLabel();

  const userName = useMemo(() => (id?: string) => userNameById(users, id), [users]);

  // "Exported" is shown (and logged) only after the file is actually saved, not when the button is clicked.
  const exportProject = async (project: Project) => {
    if (!can(principal, 'projectDatabase.export', { type: 'project', projectId: project.id })) {return;}
    const participants = useParticipantsStore.getState().participants.filter((item) => item.projectId === project.id);
    const projectSites = sites.filter((s) => s.projectId === project.id)
      .map((site) => ({ ...site, actualRecruitment: countSiteEnrolment(participants, site.id) }));
    const queries = useQueriesStore.getState().queries.filter((item) => item.projectId === project.id);
    const clinicalRows = clinicalExportRows(participants, queries);
    const isSaved = await downloadCsv(
      projectExportFilename(project.name),
      [...projectDatabaseRows(project, projectSites, { statusLabel, userName }), [], ...clinicalRows],
    );
    if (!isSaved) {return;}
    recordAudit({ page: AUDIT_PAGES.projectExport, event: `Exported project database ${project.name} (CSV)`, changedTo: `${participants.length} participants, ${clinicalRows.length - 1} clinical rows`, projectId: project.id });
    notify.success(L.exported(project.name));
  };

  return { exportProject, userName, statusLabel, sites };
}
