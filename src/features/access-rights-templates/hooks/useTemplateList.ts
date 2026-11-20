import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ban, Eye, Pencil, RotateCcw } from 'lucide-react';
import type { AccessRightsSet } from '@/types';
import { createSrNoColumn, createStatusColumn, type DataGridColumn, type RowAction } from '@/components/data-grid';
import { notify, useAccessRightsSetsStore } from '@/store';
import { usePermissionChecker } from '@/rbac';
import { ROUTES, paths } from '@/app/router/route-paths.constants';
import { USER_TYPE_LABELS } from '@/constants/user.constants';
import { ACCESS_RIGHTS_COLUMN_LABELS as C, ACCESS_RIGHTS_LABELS as L } from '../constants/access-rights.constants';
import { saveErrorMessage } from '../utils/access-rights.utils';

export function useTemplateList() {
  const navigate = useNavigate();
  const { sets, loadState, loadError, load, setActive } = useAccessRightsSetsStore();
  const can = usePermissionChecker();
  const [pending, setPending] = useState<AccessRightsSet | null>(null);

  // Fetch on every visit so the list shows changes made elsewhere.
  useEffect(() => {
    void load();
  }, [load]);

  const canCreate = can('masterDefaultAccessRights.new');
  const canEdit = can('masterDefaultAccessRights.edit');
  const canToggle = can('masterDefaultAccessRights.delete');

  const columns = useMemo<DataGridColumn<AccessRightsSet>[]>(
    () => [
      createSrNoColumn<AccessRightsSet>(),
      { id: 'name', header: C.name, accessorKey: 'name', meta: { className: 'font-medium sm:min-w-36' } },
      {
        id: 'userType',
        header: C.userType,
        accessorFn: (t) => USER_TYPE_LABELS[t.userType],
        meta: { filterVariant: 'select', hideBelow: 'sm' },
      },
      { id: 'createdBy', header: C.createdBy, accessorKey: 'createdByName', meta: { hideBelow: 'lg' } },
      createStatusColumn<AccessRightsSet>((t) => t.status, C.status),
    ],
    [],
  );

  const rowActions = (template: AccessRightsSet): RowAction[] => {
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
    createLabel: canCreate ? L.addButton : undefined,
    createTo: canCreate ? ROUTES.accessRightsNew : undefined,
    columns,
    data: sets,
    getRowId: (t: AccessRightsSet) => t.id,
    rowActions,
    isRowMuted: (t: AccessRightsSet) => t.status !== 'active',
    searchPlaceholder: L.searchPlaceholder,
    emptyTitle: loadState === 'loading' ? L.loading : loadState === 'failed' ? L.loadFailed : undefined,
    emptyDescription: loadState === 'failed' ? (loadError ?? undefined) : undefined,
    confirm: {
      isOpen: !!pending,
      title: isDeactivating ? L.confirmDeactivateTitle : L.confirmReactivateTitle,
      message: isDeactivating ? L.confirmDeactivate(name) : L.confirmReactivate(name),
      confirmLabel: isDeactivating ? L.deactivate : L.reactivate,
      tone: isDeactivating ? ('danger' as const) : ('primary' as const),
      onConfirm: async () => {
        if (!pending) {
          return;
        }
        setPending(null);
        try {
          await setActive(pending.id, !isDeactivating);
          notify.success(isDeactivating ? L.deactivated(name) : L.reactivated(name));
        } catch (error) {
          notify.error(saveErrorMessage(error));
        }
      },
      onCancel: () => setPending(null),
    },
  };
}
