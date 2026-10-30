import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Pencil } from 'lucide-react';
import type { Project } from '@/types';
import type { RowAction } from '@/components/data-grid';
import { useUsersStore } from '@/store';
import { can, useAccessibleProjects, useCurrentPrincipal } from '@/rbac';
import { ROUTES, paths } from '@/app/router/route-paths.constants';
import { useMasterLabel } from '@/features/masters';
import { userNameById } from '@/features/user-common';
import { PROJECT_LABELS as L } from '../constants/projects.constants';
import { buildProjectColumns } from '../constants/project-columns.constants';

/** Projects list: only projects the user is affiliated to (brief §4.3). */
export function useProjectList() {
  const navigate = useNavigate();
  const principal = useCurrentPrincipal();
  const projects = useAccessibleProjects();
  const users = useUsersStore((s) => s.users);
  const masterLabel = useMasterLabel();

  const columns = useMemo(
    () => buildProjectColumns({ statusLabel: masterLabel, userName: (id) => userNameById(users, id) }),
    [users, masterLabel],
  );

  const canCreate = can(principal, 'project.new');

  const rowActions = (project: Project): RowAction[] => {
    const scope = { type: 'project' as const, projectId: project.id };
    const actions: RowAction[] = [
      { key: 'open', label: L.open, icon: FolderOpen, onClick: () => navigate(paths.projectHub(project.id)) },
    ];
    if (can(principal, 'project.edit', scope)) {
      actions.push({ key: 'edit', label: L.edit, icon: Pencil, onClick: () => navigate(paths.projectEdit(project.id)) });
    }
    return actions;
  };

  return {
    title: L.listTitle,
    description: L.listDescription,
    createLabel: canCreate ? L.addButton : undefined,
    createTo: canCreate ? ROUTES.projectNew : undefined,
    columns,
    // Newest first, as in the PDF lists.
    data: [...projects].reverse(),
    getRowId: (p: Project) => p.id,
    rowActions,
    searchPlaceholder: L.searchPlaceholder,
    emptyTitle: L.emptyTitle,
    emptyDescription: L.emptyDescription,
  };
}

export type ProjectListModel = ReturnType<typeof useProjectList>;
