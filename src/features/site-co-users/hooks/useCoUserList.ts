import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAffiliationsStore, useSitesStore, useUsersStore } from '@/store';
import { usePermissionChecker } from '@/rbac';
import { paths } from '@/app/router/route-paths.constants';
import { affiliationStatusKind, displayName, useAffiliationList, type AffiliationRow } from '@/features/user-common';
import { CO_USER_LABELS as L } from '../constants/co-users.constants';

export function useCoUserList() {
  const navigate = useNavigate();
  const { projectId = '', siteId = '' } = useParams();
  const site = useSitesStore((s) => s.sites.find((x) => x.id === siteId));
  const affiliations = useAffiliationsStore((s) => s.coAffiliations);
  const deaffiliate = useAffiliationsStore((s) => s.deaffiliateCoUser);
  const users = useUsersStore((s) => s.users);
  const can = usePermissionChecker();

  const rows = useMemo<AffiliationRow[]>(
    () =>
      affiliations
        .filter((a) => a.siteId === siteId)
        .map((a) => {
          const user = users.find((u) => u.id === a.userId);
          return {
            id: a.id,
            userId: a.userId,
            name: displayName(user),
            email: user?.email ?? '',
            organization: user?.organization ?? '',
            designation: a.designation,
            statusKind: affiliationStatusKind(a.status, user),
          };
        })
        .reverse(),
    [affiliations, users, siteId],
  );

  const canAffiliate = can('coUserManagement.affiliate');
  const list = useAffiliationList({
    rows,
    hasOrganization: true,
    whereLabel: site?.siteCode ?? '',
    canView: can('coUserManagement.view'),
    canEdit: can('coUserManagement.edit'),
    // No "delete" column for this module: Deaffiliate is the reverse of Affiliate.
    endAction: { kind: 'deaffiliate', isAllowed: canAffiliate, run: deaffiliate },
    onView: (id) => navigate(paths.siteCoUserView(projectId, siteId, id)),
    onEdit: (id) => navigate(paths.siteCoUserEdit(projectId, siteId, id)),
  });

  return {
    title: L.listTitle,
    description: L.listDescription(site?.siteCode ?? ''),
    backTo: paths.siteHub(projectId, siteId),
    createLabel: canAffiliate ? L.affiliateButton : undefined,
    createTo: canAffiliate ? paths.siteCoUserAffiliate(projectId, siteId) : undefined,
    searchPlaceholder: L.searchPlaceholder,
    ...list,
  };
}
