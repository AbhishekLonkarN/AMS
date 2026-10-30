import { useNavigate } from 'react-router-dom';
import { Ban, RotateCcw } from 'lucide-react';
import { PERMISSION_CATALOG, usePermission } from '@/rbac';
import { useAccessRightsStore, useUsersStore } from '@/store';
import { paths } from '@/app/router/route-paths.constants';
import { ACCOUNT_TYPE_LABELS } from '@/constants/user.constants';
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
import { ACCOUNTS_LABELS as L } from '../constants/accounts.constants';
import { useAccountAffiliations } from './useAccountAffiliations';

/** Read-only details, affiliations and global rights of one sponsor / CO account (drawer View mode). */
export function useAccountDetail(userId?: string) {
  const navigate = useNavigate();
  const users = useUsersStore((s) => s.users);
  const templates = useAccessRightsStore((s) => s.templates);
  const canEdit = usePermission('sponsorCoUser.edit');
  const statusToggle = useUserStatusToggle();
  const user = users.find((u) => u.id === userId && (u.userType === 'sponsor' || u.userType === 'co'));
  const affiliations = useAccountAffiliations(user);

  if (!user) return { isNotFound: true as const };

  const isSponsor = user.accountType === 'sponsor';
  const isActive = user.status === 'active';
  const template = templates.find((t) => t.id === user.globalTemplateId);
  const toolbarActions: DrawerToolbarAction[] = canEdit
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
    subtitle: `${user.email}${user.accountType ? ` · ${ACCOUNT_TYPE_LABELS[user.accountType]}` : ''}`,
    status: user.status,
    sections: [
      {
        title: L.identitySection,
        items: [
          { label: F.prefix, value: user.prefix },
          { label: F.name, value: user.name },
          { label: F.email, value: user.email },
          { label: F.organization, value: user.organization },
          { label: F.accountType, value: user.accountType && ACCOUNT_TYPE_LABELS[user.accountType] },
        ],
      },
      {
        title: L.affiliations,
        items: [{ label: L.affiliationsLabel, value: affiliations.length ? affiliations.join('\n') : L.noAffiliations }],
      },
      {
        title: D.record,
        items: [
          ...(isSponsor ? [{ label: F.templateOptional, value: template?.name }] : []),
          { label: F.createdAt, value: formatCreated(user.createdAt) },
          { label: F.createdBy, value: userNameById(users, user.createdBy) },
        ],
      },
    ],
    matrix: isSponsor
      ? {
          title: L.globalMatrixTitle,
          matrix: PERMISSION_CATALOG.sponsor,
          scopeTypes: ['global' as const],
          permissions: user.globalGrant ?? [],
          templatePermissions: templateSlice(templates, user.globalTemplateId, 'sponsor', 'global'),
          templateName: template?.name,
        }
      : undefined,
    toolbarActions,
    onEdit: canEdit ? () => navigate(paths.accountEdit(user.id)) : undefined,
    confirm: statusToggle.confirm,
  };
}
