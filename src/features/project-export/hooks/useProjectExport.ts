import { useMemo } from 'react';
import type { Project } from '@/types';
import { notify, recordAudit, useProjectsStore, useSitesStore, useUsersStore } from '@/store';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { downloadCsv } from '@/utils/download.utils';
import { useMasterLabel } from '@/features/masters';
import { userNameById } from '@/features/user-common';
import { PROJECT_EXPORT_LABELS as L } from '../constants/project-export.constants';
import { buildProjectExportColumns } from '../constants/project-export-columns.constants';
import { projectDatabaseRows, projectExportFilename } from '../utils/project-export.utils';

/** Every project created by a sponsor, each with an Export button that downloads its database. */
export function useProjectExport() {
  const projects = useProjectsStore((s) => s.projects);
  const sites = useSitesStore((s) => s.sites);
  const users = useUsersStore((s) => s.users);
  const statusLabel = useMasterLabel();

  const userName = useMemo(() => (id?: string) => userNameById(users, id), [users]);

  // Newest first, as in the PDF lists.
  const rows = useMemo(() => [...projects].reverse(), [projects]);

  // "Exported" is shown (and logged) only after the file is actually saved, not when the button is clicked.
  const exportProject = async (project: Project) => {
    const projectSites = sites.filter((s) => s.projectId === project.id);
    const isSaved = await downloadCsv(
      projectExportFilename(project.name),
      projectDatabaseRows(project, projectSites, { statusLabel, userName }),
    );
    if (!isSaved) return;
    recordAudit({ page: AUDIT_PAGES.projectExport, event: `Exported project database ${project.name}`, projectId: project.id });
    notify.success(L.exported(project.name));
  };

  const columns = useMemo(
    () => buildProjectExportColumns({ userName, onExport: exportProject }),
    [userName, sites, statusLabel],
  );

  return {
    title: L.title,
    description: L.description,
    columns,
    data: rows,
    getRowId: (p: Project) => p.id,
    searchPlaceholder: L.searchPlaceholder,
    emptyTitle: L.emptyTitle,
    emptyDescription: L.emptyDescription,
    itemLabel: L.itemLabel,
  };
}

export type ProjectExportModel = ReturnType<typeof useProjectExport>;
