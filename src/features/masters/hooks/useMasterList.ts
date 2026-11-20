import { useMemo, useState } from 'react';
import { Ban, Pencil, RotateCcw } from 'lucide-react';
import type { MasterItem, MasterKey } from '@/types';
import type { RowAction } from '@/components/data-grid';
import { notify } from '@/store';
import { usePermissionChecker } from '@/rbac';
import { MASTERS_CONFIG } from '../masters.config';
import { MASTER_LABELS as L } from '../constants/masters.constants';
import { buildMasterColumns } from '../constants/master-columns.constants';
import { saveErrorMessage } from '../utils/masters.utils';
import { useMasterForm } from './useMasterForm';
import { useMasterSource } from './useMasterSource';

/** Everything the generic master screen needs, driven by `MASTERS_CONFIG[masterKey]`. */
export function useMasterList(masterKey: MasterKey) {
  const config = MASTERS_CONFIG[masterKey];
  const source = useMasterSource(masterKey);
  const can = usePermissionChecker();
  const formModel = useMasterForm(config, source);
  const [pendingToggle, setPendingToggle] = useState<MasterItem | null>(null);

  const columns = useMemo(() => buildMasterColumns(config.itemName), [config]);

  const canAdd = can(config.permissions.new);
  const canEdit = can(config.permissions.edit);
  const canToggle = can(config.permissions.deactivate);

  const rowActions = (item: MasterItem): RowAction[] => {
    const actions: RowAction[] = [];
    if (canEdit) {actions.push({ key: 'edit', label: L.edit, icon: Pencil, onClick: () => formModel.openEdit(item) });}
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

  const handleConfirmToggle = async () => {
    if (!pendingToggle) {return;}
    setPendingToggle(null);
    try {
      await source.setActive(pendingToggle, !isDeactivating);
      notify.success(isDeactivating ? L.deactivated(pendingLabel) : L.reactivated(pendingLabel));
    } catch (error) {
      notify.error(saveErrorMessage(error));
    }
  };

  return {
    title: config.title,
    description: config.description,
    items: source.items,
    emptyTitle: source.emptyTitle,
    emptyDescription: source.emptyDescription,
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
      onConfirm: () => void handleConfirmToggle(),
      onCancel: () => setPendingToggle(null),
    },
  };
}

export type MasterListModel = ReturnType<typeof useMasterList>;
