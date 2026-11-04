import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ban, Eye, Pencil, RotateCcw } from 'lucide-react';
import type { User } from '@/types';
import type { RowAction } from '@/components/data-grid';
import { useSessionStore, useUsersStore } from '@/store';
import { usePermissionChecker } from '@/rbac';
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/constants/page-titles.constants';
import { paths } from '@/app/router/route-paths.constants';
import { USER_ACTION_LABELS as A, useUserStatusToggle } from '@/features/user-common';
import { USERS_COLUMNS } from '../constants/users-columns.constants';
import { CREATE_USER_OPTIONS, USERS_LIST_LABELS as L } from '../constants/users-list.constants';

/** One list for Admin, Sponsor and CO users; each row follows the rights of its own type. */
export function useUsersList() {
  const navigate = useNavigate();
  const users = useUsersStore((s) => s.users);
  const currentUserId = useSessionStore((s) => s.currentUserId);
  const can = usePermissionChecker();
  const statusToggle = useUserStatusToggle();

  const canViewAdmins = can('adminUser.view');
  const canViewAccounts = can('sponsorCoUser.view');

  // Newest first, as in the PDF lists; only the types the admin may view.
  const rows = useMemo(
    () =>
      [...users].reverse().filter((u) => {
        if (u.userType === 'admin') return canViewAdmins;
        if (u.userType === 'sponsor' || u.userType === 'co') return canViewAccounts;
        return false;
      }),
    [users, canViewAdmins, canViewAccounts],
  );

  const rowActions = (user: User): RowAction[] => {
    const isAdmin = user.userType === 'admin';
    const canView = can(isAdmin ? 'adminUser.view' : 'sponsorCoUser.view');
    const canEdit = can(isAdmin ? 'adminUser.edit' : 'sponsorCoUser.edit');
    const view = isAdmin ? paths.adminUserView(user.id) : paths.accountView(user.id);
    const edit = isAdmin ? paths.adminUserEdit(user.id) : paths.accountEdit(user.id);

    const actions: RowAction[] = [];
    if (canView) actions.push({ key: 'view', label: A.view, icon: Eye, onClick: () => navigate(view) });
    if (canEdit) {
      actions.push({ key: 'edit', label: A.edit, icon: Pencil, onClick: () => navigate(edit) });
      // An admin cannot deactivate their own account.
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

  const createOptions = CREATE_USER_OPTIONS.filter((option) => can(option.permission)).map(({ key, label, to }) => ({
    key,
    label,
    to,
  }));

  return {
    title: PAGE_TITLES.users,
    description: PAGE_DESCRIPTIONS.users,
    createMenu: createOptions.length ? { label: L.createButton, options: createOptions } : undefined,
    columns: USERS_COLUMNS,
    data: rows,
    getRowId: (u: User) => u.id,
    rowActions,
    isRowMuted: (u: User) => u.status !== 'active',
    searchPlaceholder: L.searchPlaceholder,
    itemLabel: 'users',
    confirm: statusToggle.confirm,
  };
}
