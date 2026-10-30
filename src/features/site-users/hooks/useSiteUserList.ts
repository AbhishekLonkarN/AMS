import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { notify, useAffiliationsStore, useSitesStore, useUsersStore } from '@/store';
import { usePermissionChecker } from '@/rbac';
import { paths } from '@/app/router/route-paths.constants';
import { affiliationStatusKind, displayName, useAffiliationList, type AffiliationRow } from '@/features/user-common';
import { SITE_USER_LABELS as L } from '../constants/site-users.constants';

export function useSiteUserList() {
  const navigate = useNavigate();
  const { projectId = '', siteId = '' } = useParams();
  const site = useSitesStore((s) => s.sites.find((x) => x.id === siteId));
  const memberships = useAffiliationsStore((s) => s.siteMemberships);
  const setSiteMembershipStatus = useAffiliationsStore((s) => s.setSiteMembershipStatus);
  const users = useUsersStore((s) => s.users);
  const can = usePermissionChecker();

  const rows = useMemo<AffiliationRow[]>(
    () =>
      memberships
        .filter((m) => m.siteId === siteId)
        .map((m) => {
          const user = users.find((u) => u.id === m.userId);
          return {
            id: m.id,
            userId: m.userId,
            name: displayName(user),
            email: user?.email ?? '',
            organization: '',
            designation: m.designation,
            statusKind: affiliationStatusKind(m.status),
          };
        })
        .reverse(),
    [memberships, users, siteId],
  );

  const canCreate = can('siteUserManagement.new');
  const canEdit = can('siteUserManagement.edit');
  const list = useAffiliationList({
    rows,
    hasOrganization: false,
    whereLabel: site?.siteCode ?? '',
    canView: can('siteUserManagement.view'),
    canEdit,
    // No "delete" column for this module: Deactivate is gated by Edit.
    endAction: {
      kind: 'toggleStatus',
      isAllowed: canEdit,
      run: (id, isActivating) => setSiteMembershipStatus(id, isActivating ? 'active' : 'inactive'),
    },
    onView: (id) => navigate(paths.siteUserView(projectId, siteId, id)),
    onEdit: (id) => navigate(paths.siteUserEdit(projectId, siteId, id)),
  });

  return {
    title: L.listTitle,
    description: L.listDescription(site?.siteCode ?? ''),
    backTo: paths.siteHub(projectId, siteId),
    createLabel: canCreate ? L.createButton : undefined,
    createTo: canCreate ? paths.siteUserNew(projectId, siteId) : undefined,
    exportActions: can('siteUserManagement.export')
      ? { onExcel: () => notify.phase2(L.exportName), onPdf: () => notify.phase2(L.exportName) }
      : undefined,
    searchPlaceholder: L.searchPlaceholder,
    ...list,
  };
}
