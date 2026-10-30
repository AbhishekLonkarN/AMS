import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAffiliationsStore, useProjectsStore, useUsersStore } from '@/store';
import { usePermissionChecker } from '@/rbac';
import { paths } from '@/app/router/route-paths.constants';
import { affiliationStatusKind, displayName, useAffiliationList, type AffiliationRow } from '@/features/user-common';
import { SPONSOR_USER_LABELS as L } from '../constants/sponsor-users.constants';

export function useSponsorUserList() {
  const navigate = useNavigate();
  const { projectId = '' } = useParams();
  const project = useProjectsStore((s) => s.projects.find((p) => p.id === projectId));
  const affiliations = useAffiliationsStore((s) => s.sponsorAffiliations);
  const deaffiliate = useAffiliationsStore((s) => s.deaffiliateSponsorUser);
  const users = useUsersStore((s) => s.users);
  const can = usePermissionChecker();

  const rows = useMemo<AffiliationRow[]>(
    () =>
      affiliations
        .filter((a) => a.projectId === projectId)
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
    [affiliations, users, projectId],
  );

  const canAffiliate = can('sponsorUserManagement.affiliate');
  const list = useAffiliationList({
    rows,
    hasOrganization: true,
    whereLabel: project?.name ?? '',
    canView: can('sponsorUserManagement.view'),
    canEdit: can('sponsorUserManagement.edit'),
    // No "delete" column for this module: Deaffiliate is the reverse of Affiliate.
    endAction: { kind: 'deaffiliate', isAllowed: canAffiliate, run: deaffiliate },
    onView: (id) => navigate(paths.projectSponsorUserView(projectId, id)),
    onEdit: (id) => navigate(paths.projectSponsorUserEdit(projectId, id)),
  });

  return {
    title: L.listTitle,
    description: L.listDescription(project?.name ?? ''),
    backTo: paths.projectHub(projectId),
    createLabel: canAffiliate ? L.affiliateButton : undefined,
    createTo: canAffiliate ? paths.projectSponsorUserAffiliate(projectId) : undefined,
    searchPlaceholder: L.searchPlaceholder,
    ...list,
  };
}
