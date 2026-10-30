import { useParams } from 'react-router-dom';
import { useAccessRightsStore, useAffiliationsStore, useSitesStore, useUsersStore } from '@/store';
import { PERMISSION_CATALOG, usePermission } from '@/rbac';
import { paths } from '@/app/router/route-paths.constants';
import { affiliationDetailFields, affiliationStatusKind, displayName, templateSlice } from '@/features/user-common';
import { CO_USER_LABELS as L } from '../constants/co-users.constants';

/** Read-only View of a CO affiliation with its effective site rights. */
export function useCoUserDetail() {
  const { projectId = '', siteId = '', affiliationId } = useParams();
  const affiliation = useAffiliationsStore((s) => s.coAffiliations.find((a) => a.id === affiliationId && a.siteId === siteId));
  const site = useSitesStore((s) => s.sites.find((x) => x.id === siteId));
  const users = useUsersStore((s) => s.users);
  const templates = useAccessRightsStore((s) => s.templates);
  const canEdit = usePermission('coUserManagement.edit');

  if (!affiliation) return { isNotFound: true as const };

  const user = users.find((u) => u.id === affiliation.userId);
  const isActive = affiliation.status === 'active';

  return {
    isNotFound: false as const,
    title: displayName(user),
    description: L.viewDescription(site?.siteCode ?? ''),
    backTo: paths.siteCoUsers(projectId, siteId),
    editTo: canEdit && isActive ? paths.siteCoUserEdit(projectId, siteId, affiliation.id) : undefined,
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
      matrix: PERMISSION_CATALOG.co,
      permissions: isActive ? affiliation.permissions : [],
      templatePermissions: templateSlice(templates, affiliation.templateId, 'co'),
      templateName: templates.find((t) => t.id === affiliation.templateId)?.name,
    },
  };
}
