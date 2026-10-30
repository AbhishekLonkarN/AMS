import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ban, Eye, Pencil, RotateCcw } from 'lucide-react';
import type { AccessRightsTemplate } from '@/types';
import { createSrNoColumn, createStatusColumn, type DataGridColumn, type RowAction } from '@/components/data-grid';
import { notify, useAccessRightsStore, useUsersStore } from '@/store';
import { usePermissionChecker } from '@/rbac';
import { ROUTES, paths } from '@/app/router/route-paths.constants';
import { USER_TYPE_LABELS } from '@/constants/user.constants';
import { userNameById } from '@/features/user-common';
import { ACCESS_RIGHTS_COLUMN_LABELS as C, ACCESS_RIGHTS_LABELS as L } from '../constants/access-rights.constants';

export function useTemplateList() {
  const navigate = useNavigate();
  const templates = useAccessRightsStore((s) => s.templates);
  const toggleTemplateStatus = useAccessRightsStore((s) => s.toggleTemplateStatus);
  const users = useUsersStore((s) => s.users);
  const can = usePermissionChecker();
  const [pending, setPending] = useState<AccessRightsTemplate | null>(null);

  const canCreate = can('masterDefaultAccessRights.new');
  const canEdit = can('masterDefaultAccessRights.edit');
  const canToggle = can('masterDefaultAccessRights.delete');

  const columns = useMemo<DataGridColumn<AccessRightsTemplate>[]>(
    () => [
      createSrNoColumn<AccessRightsTemplate>(),
      { id: 'name', header: C.name, accessorKey: 'name', meta: { className: 'font-medium' } },
      {
        id: 'userType',
        header: C.userType,
        accessorFn: (t) => USER_TYPE_LABELS[t.userType],
        meta: { filterVariant: 'select' },
      },
      { id: 'createdBy', header: C.createdBy, accessorFn: (t) => userNameById(users, t.createdBy) },
      createStatusColumn<AccessRightsTemplate>((t) => t.status, C.status),
    ],
    [users],
  );

  const rowActions = (template: AccessRightsTemplate): RowAction[] => {
    const actions: RowAction[] = [
      { key: 'view', label: L.view, icon: Eye, onClick: () => navigate(paths.accessRightsView(template.id)) },
    ];
    if (canEdit) {
      actions.push({ key: 'edit', label: L.edit, icon: Pencil, onClick: () => navigate(paths.accessRightsEdit(template.id)) });
    }
    if (canToggle) {
      const isActive = template.status === 'active';
      actions.push({
        key: 'toggle',
        label: isActive ? L.deactivate : L.reactivate,
        icon: isActive ? Ban : RotateCcw,
        tone: isActive ? 'danger' : 'default',
        onClick: () => setPending(template),
      });
    }
    return actions;
  };

  const isDeactivating = pending?.status === 'active';
  const name = pending?.name ?? '';

  return {
    title: L.listTitle,
    description: L.listDescription,
    backTo: ROUTES.masters,
    createLabel: canCreate ? L.addButton : undefined,
    createTo: canCreate ? ROUTES.accessRightsNew : undefined,
    columns,
    data: templates,
    getRowId: (t: AccessRightsTemplate) => t.id,
    rowActions,
    isRowMuted: (t: AccessRightsTemplate) => t.status !== 'active',
    searchPlaceholder: L.searchPlaceholder,
    confirm: {
      isOpen: !!pending,
      title: isDeactivating ? L.confirmDeactivateTitle : L.confirmReactivateTitle,
      message: isDeactivating ? L.confirmDeactivate(name) : L.confirmReactivate(name),
      confirmLabel: isDeactivating ? L.deactivate : L.reactivate,
      tone: isDeactivating ? ('danger' as const) : ('primary' as const),
      onConfirm: () => {
        if (!pending) return;
        toggleTemplateStatus(pending.id);
        notify.success(isDeactivating ? L.deactivated(name) : L.reactivated(name));
        setPending(null);
      },
      onCancel: () => setPending(null),
    },
  };
}
