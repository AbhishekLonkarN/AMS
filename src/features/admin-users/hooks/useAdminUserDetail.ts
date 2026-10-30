import { useNavigate } from 'react-router-dom';
import { Ban, RotateCcw } from 'lucide-react';
import { PERMISSION_CATALOG, usePermission } from '@/rbac';
import { useAccessRightsStore, useSessionStore, useUsersStore } from '@/store';
import { paths } from '@/app/router/route-paths.constants';
import {
  DRAWER_LABELS as D,
  USER_ACTION_LABELS as A,
  USER_FIELD_LABELS as F,
  displayName,
  formatCreated,
  templateSlice,
  useUserStatusToggle,
  userNameById,
  type DrawerToolbarAction,
} from '@/features/user-common';
import { ADMIN_USERS_LABELS as L } from '../constants/admin-users.constants';

/** Read-only details + effective rights of one admin user (drawer View mode). */
export function useAdminUserDetail(userId?: string) {
  const navigate = useNavigate();
  const users = useUsersStore((s) => s.users);
  const templates = useAccessRightsStore((s) => s.templates);
  const currentUserId = useSessionStore((s) => s.currentUserId);
  const canEdit = usePermission('adminUser.edit');
  const statusToggle = useUserStatusToggle();
  const user = users.find((u) => u.id === userId && u.userType === 'admin');

  if (!user) return { isNotFound: true as const };

  const template = templates.find((t) => t.id === user.globalTemplateId);
  const isActive = user.status === 'active';
  const toolbarActions: DrawerToolbarAction[] =
    canEdit && user.id !== currentUserId
      ? [
          {
            key: 'toggle',
            label: isActive ? A.deactivate : A.reactivate,
            icon: isActive ? Ban : RotateCcw,
            tone: isActive ? 'danger' : 'default',
            onClick: () => statusToggle.requestToggle(user),
          },
        ]
      : [];

  return {
    isNotFound: false as const,
    title: displayName(user),
    subtitle: user.email,
    status: user.status,
    sections: [
      {
        title: L.identitySection,
        items: [
          { label: F.prefix, value: user.prefix },
          { label: F.name, value: user.name },
          { label: F.email, value: user.email },
          { label: F.organization, value: user.organization },
        ],
      },
      {
        title: D.record,
        items: [
          { label: F.templateOptional, value: template?.name },
          { label: F.createdAt, value: formatCreated(user.createdAt) },
          { label: F.createdBy, value: userNameById(users, user.createdBy) },
        ],
      },
    ],
    matrix: {
      title: L.matrixTitle,
      matrix: PERMISSION_CATALOG.admin,
      permissions: user.globalGrant ?? [],
      templatePermissions: templateSlice(templates, user.globalTemplateId, 'admin'),
      templateName: template?.name,
    },
    toolbarActions,
    onEdit: canEdit ? () => navigate(paths.adminUserEdit(user.id)) : undefined,
    confirm: statusToggle.confirm,
  };
}
