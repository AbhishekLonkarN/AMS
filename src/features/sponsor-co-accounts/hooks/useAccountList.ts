import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ban, Eye, Pencil, RotateCcw } from 'lucide-react';
import type { User } from '@/types';
import type { RowAction } from '@/components/data-grid';
import { useUsersStore } from '@/store';
import { usePermissionChecker } from '@/rbac';
import { ROUTES, paths } from '@/app/router/route-paths.constants';
import { USER_ACTION_LABELS as A, useUserStatusToggle } from '@/features/user-common';
import { ACCOUNTS_LABELS as L } from '../constants/accounts.constants';
import { ACCOUNT_COLUMNS } from '../constants/accounts-columns.constants';

export function useAccountList() {
  const navigate = useNavigate();
  const users = useUsersStore((s) => s.users);
  const can = usePermissionChecker();
  const statusToggle = useUserStatusToggle();

  // Newest first, as in the PDF lists.
  const accounts = useMemo(
    () => users.filter((u) => u.userType === 'sponsor' || u.userType === 'co').reverse(),
    [users],
  );
  const canCreate = can('sponsorCoUser.new');
  const canEdit = can('sponsorCoUser.edit');
  const canView = can('sponsorCoUser.view');

  const rowActions = (user: User): RowAction[] => {
    const actions: RowAction[] = [];
    if (canView) actions.push({ key: 'view', label: A.view, icon: Eye, onClick: () => navigate(paths.accountView(user.id)) });
    if (canEdit) {
      const isActive = user.status === 'active';
      actions.push(
        { key: 'edit', label: A.edit, icon: Pencil, onClick: () => navigate(paths.accountEdit(user.id)) },
        {
          key: 'toggle',
          label: isActive ? A.deactivate : A.reactivate,
          icon: isActive ? Ban : RotateCcw,
          tone: isActive ? 'danger' : 'default',
          onClick: () => statusToggle.requestToggle(user),
        },
      );
    }
    return actions;
  };

  return {
    title: L.listTitle,
    description: L.listDescription,
    createLabel: canCreate ? L.createButton : undefined,
    createTo: canCreate ? ROUTES.accountNew : undefined,
    columns: ACCOUNT_COLUMNS,
    data: accounts,
    getRowId: (u: User) => u.id,
    rowActions,
    isRowMuted: (u: User) => u.status !== 'active',
    searchPlaceholder: L.searchPlaceholder,
    confirm: statusToggle.confirm,
  };
}
