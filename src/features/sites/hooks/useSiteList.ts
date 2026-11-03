import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Hospital, Pencil } from 'lucide-react';
import type { Site } from '@/types';
import type { RowAction } from '@/components/data-grid';
import { useAccessibleSites, usePermission } from '@/rbac';
import { paths } from '@/app/router/route-paths.constants';
import { useMasterLabel } from '@/features/masters';
import { SITE_LABELS as L } from '../constants/sites.constants';
import { buildSiteColumns } from '../constants/site-columns.constants';

export function useSiteList() {
  const navigate = useNavigate();
  const { projectId = '' } = useParams();
  const sites = useAccessibleSites(projectId);
  const masterLabel = useMasterLabel();
  const canCreate = usePermission('investigatorSite.new');
  const canEdit = usePermission('investigatorSite.edit');

  const columns = useMemo(() => buildSiteColumns(masterLabel), [masterLabel]);

  const rowActions = (site: Site): RowAction[] => {
    const actions: RowAction[] = [
      { key: 'open', label: L.open, icon: Hospital, onClick: () => navigate(paths.siteHub(projectId, site.id)) },
    ];
    if (canEdit) {
      actions.push({ key: 'edit', label: L.edit, icon: Pencil, onClick: () => navigate(paths.projectSiteListEdit(projectId, site.id)) });
    }
    return actions;
  };

  return {
    title: L.listTitle,
    description: L.listDescription,
    backTo: paths.projectHub(projectId),
    createLabel: canCreate ? L.addButton : undefined,
    createTo: canCreate ? paths.projectSiteNew(projectId) : undefined,
    columns,
    // Newest first, as in the PDF lists.
    data: [...sites].reverse(),
    getRowId: (s: Site) => s.id,
    rowActions,
    searchPlaceholder: L.searchPlaceholder,
    emptyTitle: L.emptyTitle,
    emptyDescription: L.emptyDescription,
  };
}
