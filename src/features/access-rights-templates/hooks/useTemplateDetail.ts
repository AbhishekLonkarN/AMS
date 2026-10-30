import { useParams } from 'react-router-dom';
import { PERMISSION_CATALOG, usePermission } from '@/rbac';
import { useAccessRightsStore, useUsersStore } from '@/store';
import { ROUTES, paths } from '@/app/router/route-paths.constants';
import { USER_TYPE_LABELS } from '@/constants/user.constants';
import { USER_FIELD_LABELS, formatCreated, userNameById, type DetailField } from '@/features/user-common';
import { ACCESS_RIGHTS_FIELDS as F, ACCESS_RIGHTS_LABELS as L } from '../constants/access-rights.constants';
import { useTemplateUsage } from './useTemplateUsage';

export function useTemplateDetail() {
  const { templateId } = useParams();
  const template = useAccessRightsStore((s) => s.templates.find((t) => t.id === templateId));
  const users = useUsersStore((s) => s.users);
  const usage = useTemplateUsage();
  const canEdit = usePermission('masterDefaultAccessRights.edit');

  if (!template) return { isNotFound: true as const };

  const fields: DetailField[] = [
    { label: F.name, value: template.name },
    { label: F.userType, value: USER_TYPE_LABELS[template.userType] },
    { label: F.createdBy, value: userNameById(users, template.createdBy) },
    { label: USER_FIELD_LABELS.createdAt, value: formatCreated(template.createdAt) },
    { label: L.usedBy, value: L.usedByValue(usage.get(template.id) ?? 0) },
  ];

  return {
    isNotFound: false as const,
    title: template.name,
    description: L.viewDescription,
    backTo: ROUTES.accessRights,
    editTo: canEdit ? paths.accessRightsEdit(template.id) : undefined,
    status: template.status,
    sectionTitle: L.detailsSection,
    fields,
    matrix: {
      title: L.matrixTitle(USER_TYPE_LABELS[template.userType]),
      matrix: PERMISSION_CATALOG[template.userType],
      permissions: template.permissions,
    },
  };
}
