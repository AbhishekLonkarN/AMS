import { useNavigate } from 'react-router-dom';
import { useAccessRightsStore, useAffiliationsStore, useProjectsStore, useSitesStore, useUsersStore } from '@/store';
import { PERMISSION_CATALOG, usePermission } from '@/rbac';
import { paths } from '@/app/router/route-paths.constants';
import {
  affiliationDetailSections,
  affiliationStatusKind,
  displayName,
  templateSlice,
  useEndAction,
  type DrawerToolbarAction,
} from '@/features/user-common';
import { SITE_USER_LABELS as L } from '../constants/site-users.constants';

/** Read-only View of a site membership, its other sites and effective site rights (drawer), + Deactivate. */
export function useSiteUserDetail(projectId: string, siteId: string, membershipId?: string) {
  const navigate = useNavigate();
  const memberships = useAffiliationsStore((s) => s.siteMemberships);
  const setSiteMembershipStatus = useAffiliationsStore((s) => s.setSiteMembershipStatus);
  const sites = useSitesStore((s) => s.sites);
  const projects = useProjectsStore((s) => s.projects);
  const users = useUsersStore((s) => s.users);
  const templates = useAccessRightsStore((s) => s.templates);
  const canEdit = usePermission('siteUserManagement.edit');
  const site = sites.find((s) => s.id === siteId);
  // No "delete" column for this module: Deactivate is gated by Edit.
  const end = useEndAction(
    {
      kind: 'toggleStatus',
      isAllowed: canEdit,
      run: (id, isActivating) => setSiteMembershipStatus(id, isActivating ? 'active' : 'inactive'),
    },
    site?.siteCode ?? '',
  );

  const membership = memberships.find((m) => m.id === membershipId && m.siteId === siteId);
  if (!membership) return { isNotFound: true as const };

  const user = users.find((u) => u.id === membership.userId);
  const statusKind = affiliationStatusKind(membership.status);
  const otherSites = memberships
    .filter((m) => m.userId === membership.userId && m.id !== membership.id)
    .map((m) => {
      const other = sites.find((s) => s.id === m.siteId);
      const projectName = projects.find((p) => p.id === m.projectId)?.name;
      return `${projectName} · ${other?.siteCode} (${m.designation})`;
    });
  const endButton = end.actionFor({ id: membership.id, userId: membership.userId, name: displayName(user), statusKind });
  const toolbarActions: DrawerToolbarAction[] = endButton ? [endButton] : [];

  return {
    isNotFound: false as const,
    title: displayName(user),
    subtitle: L.viewDescription(site?.siteCode ?? ''),
    status: statusKind,
    sections: affiliationDetailSections({
      user,
      designation: membership.designation,
      timeZone: membership.timeZone,
      templateId: membership.templateId,
      status: membership.status,
      since: membership.createdAt,
      sinceBy: membership.createdBy,
      hasOrganization: false,
      users,
      templates,
      assignmentTitle: L.assignmentSection,
      extraAssignmentFields: [{ label: L.otherSites, value: otherSites.length ? otherSites.join('\n') : L.noOtherSites }],
    }),
    matrix: {
      title: L.matrixTitle,
      matrix: PERMISSION_CATALOG.site,
      permissions: membership.status === 'active' ? membership.permissions : [],
      templatePermissions: templateSlice(templates, membership.templateId, 'site'),
      templateName: templates.find((t) => t.id === membership.templateId)?.name,
    },
    toolbarActions,
    onEdit: canEdit ? () => navigate(paths.siteUserEdit(projectId, siteId, membership.id)) : undefined,
    confirm: end.confirm,
  };
}
