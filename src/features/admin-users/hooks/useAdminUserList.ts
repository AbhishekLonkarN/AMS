import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ban, Eye, Pencil, RotateCcw } from 'lucide-react';
import type { User } from '@/types';
import type { RowAction } from '@/components/data-grid';
import { useSessionStore, useUsersStore } from '@/store';
import { usePermissionChecker } from '@/rbac';
import { ROUTES, paths } from '@/app/router/route-paths.constants';
import { USER_ACTION_LABELS as A, useUserStatusToggle } from '@/features/user-common';
import { ADMIN_USERS_LABELS as L } from '../constants/admin-users.constants';
import { ADMIN_USER_COLUMNS } from '../constants/admin-users-columns.constants';

export function useAdminUserList() {
  const navigate = useNavigate();
  const users = useUsersStore((s) => s.users);
  const currentUserId = useSessionStore((s) => s.currentUserId);
  const can = usePermissionChecker();
  const statusToggle = useUserStatusToggle();

  // Newest first, as in the PDF lists.
  const admins = useMemo(() => users.filter((u) => u.userType === 'admin').reverse(), [users]);
  const canCreate = can('adminUser.new');
  const canEdit = can('adminUser.edit');
  const canView = can('adminUser.view');

  const rowActions = (user: User): RowAction[] => {
    const actions: RowAction[] = [];
    if (canView) actions.push({ key: 'view', label: A.view, icon: Eye, onClick: () => navigate(paths.adminUserView(user.id)) });
    if (canEdit) {
      actions.push({ key: 'edit', label: A.edit, icon: Pencil, onClick: () => navigate(paths.adminUserEdit(user.id)) });
      if (user.id !== currentUserId) {
        const isActive = user.status === 'active';
        actions.push({
          key: 'toggle',
          label: isActive ? A.deactivate : A.reactivate,
          icon: isActive ? Ban : RotateCcw,
          tone: isActive ? 'danger' : 'default',
          onClick: () => statusToggle.requestToggle(user),
        });
      }
    }
    return actions;
  };

  return {
    title: L.listTitle,
    description: L.listDescription,
    createLabel: canCreate ? L.createButton : undefined,
    createTo: canCreate ? ROUTES.adminUserNew : undefined,
    columns: ADMIN_USER_COLUMNS,
    data: admins,
    getRowId: (u: User) => u.id,
    rowActions,
    isRowMuted: (u: User) => u.status !== 'active',
    searchPlaceholder: L.searchPlaceholder,
    confirm: statusToggle.confirm,
  };
}
