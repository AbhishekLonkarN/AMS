import { useNavigate } from 'react-router-dom';
import { useAccessRightsStore, useAffiliationsStore, useSitesStore, useUsersStore } from '@/store';
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
import { CO_USER_LABELS as L } from '../constants/co-users.constants';

/** Read-only View of a CO affiliation with its effective site rights (drawer), + Deaffiliate. */
export function useCoUserDetail(projectId: string, siteId: string, affiliationId?: string) {
  const navigate = useNavigate();
  const affiliation = useAffiliationsStore((s) => s.coAffiliations.find((a) => a.id === affiliationId && a.siteId === siteId));
  const deaffiliate = useAffiliationsStore((s) => s.deaffiliateCoUser);
  const site = useSitesStore((s) => s.sites.find((x) => x.id === siteId));
  const users = useUsersStore((s) => s.users);
  const templates = useAccessRightsStore((s) => s.templates);
  const can = usePermissionChecker();
  const end = useEndAction(
    { kind: 'deaffiliate', isAllowed: can('coUserManagement.affiliate'), run: deaffiliate },
    site?.siteCode ?? '',
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
    subtitle: L.viewDescription(site?.siteCode ?? ''),
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
      matrix: PERMISSION_CATALOG.co,
      permissions: isActive ? affiliation.permissions : [],
      templatePermissions: templateSlice(templates, affiliation.templateId, 'co'),
      templateName: templates.find((t) => t.id === affiliation.templateId)?.name,
    },
    toolbarActions,
    onEdit:
      can('coUserManagement.edit') && isActive
        ? () => navigate(paths.siteCoUserEdit(projectId, siteId, affiliation.id))
        : undefined,
    confirm: end.confirm,
  };
}
