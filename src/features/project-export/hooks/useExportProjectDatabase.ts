import { useMemo } from 'react';
import type { Project } from '@/types';
import { notify, recordAudit, useSitesStore, useUsersStore } from '@/store';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { downloadCsv } from '@/utils/download.utils';
import { useMasterLabel } from '@/features/masters';
import { userNameById } from '@/features/user-common';
import { PROJECT_EXPORT_LABELS as L } from '../constants/project-export.constants';
import { projectDatabaseRows, projectExportFilename } from '../utils/project-export.utils';

/** Returns a function that downloads one project's database as a file. Shared by the export list and the project hub. */
export function useExportProjectDatabase() {
  const sites = useSitesStore((s) => s.sites);
  const users = useUsersStore((s) => s.users);
  const statusLabel = useMasterLabel();

  const userName = useMemo(() => (id?: string) => userNameById(users, id), [users]);

  // "Exported" is shown (and logged) only after the file is actually saved, not when the button is clicked.
  const exportProject = async (project: Project) => {
    const projectSites = sites.filter((s) => s.projectId === project.id);
    const isSaved = await downloadCsv(
      projectExportFilename(project.name),
      projectDatabaseRows(project, projectSites, { statusLabel, userName }),
    );
    if (!isSaved) {return;}
    recordAudit({ page: AUDIT_PAGES.projectExport, event: `Exported project database ${project.name}`, projectId: project.id });
    notify.success(L.exported(project.name));
  };

  return { exportProject, userName, statusLabel, sites };
}
