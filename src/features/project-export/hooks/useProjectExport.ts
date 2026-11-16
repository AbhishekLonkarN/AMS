import { useMemo } from 'react';
import type { Project } from '@/types';
import { useProjectsStore } from '@/store';
import { PROJECT_EXPORT_LABELS as L } from '../constants/project-export.constants';
import { buildProjectExportColumns } from '../constants/project-export-columns.constants';
import { useExportProjectDatabase } from './useExportProjectDatabase';

/** Every project created by a sponsor, each with an Export button that downloads its database. */
export function useProjectExport() {
  const projects = useProjectsStore((s) => s.projects);
  const { exportProject, userName, sites, statusLabel } = useExportProjectDatabase();

  // Newest first, as in the PDF lists.
  const rows = useMemo(() => [...projects].reverse(), [projects]);

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
