import { useNavigate } from 'react-router-dom';
import { useAccessRightsStore, useAffiliationsStore, useProjectsStore, useUsersStore } from '@/store';
import { PERMISSION_CATALOG, usePermissionChecker } from '@/rbac';
import { paths } from '@/app/router/route-paths.constants';
import {
  AFFILIATION_LABELS as A,
  affiliationDetailSections,
  affiliationStatusKind,
  displayName,
  templateSlice,
  useEndAction,
  type DrawerToolbarAction,
} from '@/features/user-common';
import { SPONSOR_USER_LABELS as L } from '../constants/sponsor-users.constants';

/** Read-only View of a sponsor affiliation with its effective project rights (drawer), + Deaffiliate. */
export function useSponsorUserDetail(projectId: string, affiliationId?: string) {
  const navigate = useNavigate();
  const affiliation = useAffiliationsStore((s) =>
    s.sponsorAffiliations.find((a) => a.id === affiliationId && a.projectId === projectId),
  );
  const deaffiliate = useAffiliationsStore((s) => s.deaffiliateSponsorUser);
  const project = useProjectsStore((s) => s.projects.find((p) => p.id === projectId));
  const users = useUsersStore((s) => s.users);
  const templates = useAccessRightsStore((s) => s.templates);
  const can = usePermissionChecker();
  const end = useEndAction(
    { kind: 'deaffiliate', isAllowed: can('sponsorUserManagement.affiliate'), run: deaffiliate },
    project?.name ?? '',
  );

  if (!affiliation) return { isNotFound: true as const };

  const user = users.find((u) => u.id === affiliation.userId);
  const isActive = affiliation.status === 'active';
  const statusKind = affiliationStatusKind(affiliation.status, user);
  const endButton = end.actionFor({ id: affiliation.id, userId: affiliation.userId, name: displayName(user), statusKind });
  const toolbarActions: DrawerToolbarAction[] = endButton ? [endButton] : [];

  return {
    isNotFound: false as const,
    title: displayName(user),
    subtitle: L.viewDescription(project?.name ?? ''),
    status: statusKind,
    sections: affiliationDetailSections({
      user,
      designation: affiliation.designation,
      timeZone: affiliation.timeZone,
      templateId: affiliation.templateId,
      status: affiliation.status,
      since: affiliation.affiliatedAt,
      sinceBy: affiliation.affiliatedBy,
      endedAt: affiliation.deaffiliatedAt,
      hasOrganization: true,
      users,
      templates,
      assignmentTitle: A.assignmentSection,
    }),
    matrix: {
      title: L.matrixTitle,
      matrix: PERMISSION_CATALOG.sponsor,
      scopeTypes: ['project' as const],
      // Deaffiliated users keep the record but have no effective rights.
      permissions: isActive ? affiliation.permissions : [],
      templatePermissions: templateSlice(templates, affiliation.templateId, 'sponsor', 'project'),
      templateName: templates.find((t) => t.id === affiliation.templateId)?.name,
    },
    toolbarActions,
    onEdit:
      can('sponsorUserManagement.edit') && isActive
        ? () => navigate(paths.projectSponsorUserEdit(projectId, affiliation.id))
        : undefined,
    confirm: end.confirm,
  };
}
