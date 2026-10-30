import { useMemo, useState } from 'react';
import { Ban, Pencil, RotateCcw } from 'lucide-react';
import type { MasterItem, MasterKey } from '@/types';
import type { RowAction } from '@/components/data-grid';
import { notify, useMastersStore } from '@/store';
import { usePermissionChecker } from '@/rbac';
import { ROUTES } from '@/app/router/route-paths.constants';
import { MASTERS_CONFIG } from '../masters.config';
import { MASTER_LABELS as L } from '../constants/masters.constants';
import { buildMasterColumns } from '../constants/master-columns.constants';
import { useMasterForm } from './useMasterForm';

/** Everything the generic master screen needs, driven by `MASTERS_CONFIG[masterKey]`. */
export function useMasterList(masterKey: MasterKey) {
  const config = MASTERS_CONFIG[masterKey];
  const allItems = useMastersStore((s) => s.items);
  const toggleMasterItemStatus = useMastersStore((s) => s.toggleMasterItemStatus);
  const can = usePermissionChecker();
  const formModel = useMasterForm(config);
  const [pendingToggle, setPendingToggle] = useState<MasterItem | null>(null);

  const items = useMemo(() => allItems.filter((i) => i.masterKey === masterKey), [allItems, masterKey]);
  const columns = useMemo(() => buildMasterColumns(config.itemName), [config]);

  const canAdd = can(config.permissions.new);
  const canEdit = can(config.permissions.edit);
  const canToggle = can(config.permissions.deactivate);

  const rowActions = (item: MasterItem): RowAction[] => {
    const actions: RowAction[] = [];
    if (canEdit) actions.push({ key: 'edit', label: L.edit, icon: Pencil, onClick: () => formModel.openEdit(item) });
    if (canToggle) {
      const isActive = item.status === 'active';
      actions.push({
        key: 'toggle',
        label: isActive ? L.deactivate : L.reactivate,
        icon: isActive ? Ban : RotateCcw,
        tone: isActive ? 'danger' : 'default',
        onClick: () => setPendingToggle(item),
      });
    }
    return actions;
  };

  const isDeactivating = pendingToggle?.status === 'active';
  const pendingLabel = pendingToggle?.label ?? '';

  const handleConfirmToggle = () => {
    if (!pendingToggle) return;
    toggleMasterItemStatus(pendingToggle.id);
    notify.success(isDeactivating ? L.deactivated(pendingLabel) : L.reactivated(pendingLabel));
    setPendingToggle(null);
  };

  return {
    title: config.title,
    description: config.description,
    backTo: ROUTES.masters,
    items,
    columns,
    rowActions: canEdit || canToggle ? rowActions : undefined,
    canAdd,
    addLabel: L.addButton,
    onAdd: formModel.openCreate,
    form: formModel,
    confirm: {
      isOpen: !!pendingToggle,
      title: isDeactivating ? L.confirmDeactivateTitle(config.itemName) : L.confirmReactivateTitle(config.itemName),
      message: isDeactivating ? L.confirmDeactivate(pendingLabel) : L.confirmReactivate(pendingLabel),
      confirmLabel: isDeactivating ? L.deactivate : L.reactivate,
      tone: isDeactivating ? ('danger' as const) : ('primary' as const),
      onConfirm: handleConfirmToggle,
      onCancel: () => setPendingToggle(null),
    },
  };
}

export type MasterListModel = ReturnType<typeof useMasterList>;
