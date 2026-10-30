import { useParams } from 'react-router-dom';
import { useAccessRightsStore, useAffiliationsStore, useProjectsStore, useUsersStore } from '@/store';
import { PERMISSION_CATALOG, usePermission } from '@/rbac';
import { paths } from '@/app/router/route-paths.constants';
import { affiliationDetailFields, affiliationStatusKind, displayName, templateSlice } from '@/features/user-common';
import { SPONSOR_USER_LABELS as L } from '../constants/sponsor-users.constants';

/** Read-only View of a sponsor affiliation with its effective project rights. */
export function useSponsorUserDetail() {
  const { projectId = '', affiliationId } = useParams();
  const affiliation = useAffiliationsStore((s) =>
    s.sponsorAffiliations.find((a) => a.id === affiliationId && a.projectId === projectId),
  );
  const project = useProjectsStore((s) => s.projects.find((p) => p.id === projectId));
  const users = useUsersStore((s) => s.users);
  const templates = useAccessRightsStore((s) => s.templates);
  const canEdit = usePermission('sponsorUserManagement.edit');

  if (!affiliation) return { isNotFound: true as const };

  const user = users.find((u) => u.id === affiliation.userId);
  const isActive = affiliation.status === 'active';

  return {
    isNotFound: false as const,
    title: displayName(user),
    description: L.viewDescription(project?.name ?? ''),
    backTo: paths.projectSponsorUsers(projectId),
    editTo: canEdit && isActive ? paths.projectSponsorUserEdit(projectId, affiliation.id) : undefined,
    status: affiliationStatusKind(affiliation.status, user),
    sectionTitle: L.detailsSection,
    fields: affiliationDetailFields({
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
  };
}
