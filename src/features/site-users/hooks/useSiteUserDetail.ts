import { useParams } from 'react-router-dom';
import { useAccessRightsStore, useAffiliationsStore, useProjectsStore, useSitesStore, useUsersStore } from '@/store';
import { PERMISSION_CATALOG, usePermission } from '@/rbac';
import { paths } from '@/app/router/route-paths.constants';
import { affiliationDetailFields, affiliationStatusKind, displayName, templateSlice } from '@/features/user-common';
import { SITE_USER_LABELS as L } from '../constants/site-users.constants';

/** Read-only View of a site membership, its other sites and effective site rights. */
export function useSiteUserDetail() {
  const { projectId = '', siteId = '', membershipId } = useParams();
  const memberships = useAffiliationsStore((s) => s.siteMemberships);
  const sites = useSitesStore((s) => s.sites);
  const projects = useProjectsStore((s) => s.projects);
  const users = useUsersStore((s) => s.users);
  const templates = useAccessRightsStore((s) => s.templates);
  const canEdit = usePermission('siteUserManagement.edit');

  const membership = memberships.find((m) => m.id === membershipId && m.siteId === siteId);
  if (!membership) return { isNotFound: true as const };

  const user = users.find((u) => u.id === membership.userId);
  const site = sites.find((s) => s.id === siteId);
  const otherSites = memberships
    .filter((m) => m.userId === membership.userId && m.id !== membership.id)
    .map((m) => {
      const other = sites.find((s) => s.id === m.siteId);
      const projectName = projects.find((p) => p.id === m.projectId)?.name;
      return `${projectName} · ${other?.siteCode} (${m.designation})`;
    });

  return {
    isNotFound: false as const,
    title: displayName(user),
    description: L.viewDescription(site?.siteCode ?? ''),
    backTo: paths.siteUsers(projectId, siteId),
    editTo: canEdit ? paths.siteUserEdit(projectId, siteId, membership.id) : undefined,
    status: affiliationStatusKind(membership.status),
    sectionTitle: L.detailsSection,
    fields: [
      ...affiliationDetailFields({
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
      }),
      { label: L.otherSites, value: otherSites.length ? otherSites.join('\n') : L.noOtherSites, isFullWidth: true },
    ],
    matrix: {
      title: L.matrixTitle,
      matrix: PERMISSION_CATALOG.site,
      permissions: membership.status === 'active' ? membership.permissions : [],
      templatePermissions: templateSlice(templates, membership.templateId, 'site'),
      templateName: templates.find((t) => t.id === membership.templateId)?.name,
    },
  };
}
