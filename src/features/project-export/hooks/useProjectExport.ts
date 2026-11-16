import { useMemo } from 'react';
import type { Project } from '@/types';
import { useProjectsStore } from '@/store';
import { can, useCurrentPrincipal } from '@/rbac';
import { PROJECT_EXPORT_LABELS as L } from '../constants/project-export.constants';
import { buildProjectExportColumns } from '../constants/project-export-columns.constants';
import { useExportProjectDatabase } from './useExportProjectDatabase';

/**
 * Projects the user may export, each with an Export button that downloads its database.
 * The route only checks the right "anywhere", so each project is checked in its own scope
 * (BR-EXP-11): an admin's global grant lists every project, a sponsor sees only projects they can export.
 */
export function useProjectExport() {
  const projects = useProjectsStore((s) => s.projects);
  const principal = useCurrentPrincipal();
  const { exportProject, userName, sites, statusLabel } = useExportProjectDatabase();

  // Newest first, as in the PDF lists.
  const rows = useMemo(
    () =>
      projects
        .filter((p) => can(principal, 'projectDatabase.export', { type: 'project', projectId: p.id }))
        .reverse(),
    [projects, principal],
  );

  const columns = useMemo(
    () => buildProjectExportColumns({ userName, onExport: exportProject }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
