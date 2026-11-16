import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ban, Pencil, RotateCcw } from 'lucide-react';
import type { EcrfTemplate } from '@/types';
import {
  createSrNoColumn,
  createStatusColumn,
  type DataGridColumn,
  type RowAction,
} from '@/components/data-grid';
import { notify, useEcrfTemplatesStore, useUsersStore } from '@/store';
import { usePermissionChecker } from '@/rbac';
import { ROUTES, paths } from '@/app/router/route-paths.constants';
import { useMasterLabel } from '@/features/masters';
import { userNameById } from '@/features/user-common';
import { normalizeConfig } from '@/features/form-builder';
import {
  ECRF_TEMPLATE_COLUMNS as C,
  ECRF_TEMPLATE_LABELS as L,
} from '../constants/ecrf-templates.constants';

const sectionsOf = (t: EcrfTemplate) => normalizeConfig(t.config).sections;

export function useEcrfTemplateList() {
  const navigate = useNavigate();
  const templates = useEcrfTemplatesStore((s) => s.templates);
  const toggleStatus = useEcrfTemplatesStore((s) => s.toggleEcrfTemplateStatus);
  const users = useUsersStore((s) => s.users);
  const masterLabel = useMasterLabel();
  const can = usePermissionChecker();
  const [pending, setPending] = useState<EcrfTemplate | null>(null);

  const canCreate = can('ecrfTemplate.new');
  const canEdit = can('ecrfTemplate.edit');
  // Activate / Deactivate requires Edit (SCR-SPN-10).
  const canToggle = can('ecrfTemplate.edit');
  // Newest first (BR-TPL-02); the store appends new templates at the end.
  const rows = useMemo(() => [...templates].reverse(), [templates]);

  const columns = useMemo<DataGridColumn<EcrfTemplate>[]>(
    () => [
      createSrNoColumn<EcrfTemplate>(),
      { id: 'name', header: C.name, accessorKey: 'name', meta: { className: 'font-medium' } },
      {
        id: 'productGroup',
        header: C.productGroup,
        accessorFn: (t) => masterLabel(t.productGroupId),
        meta: { filterVariant: 'select' },
      },
      { id: 'sections', header: C.sections, accessorFn: (t) => sectionsOf(t).length },
      {
        id: 'fields',
        header: C.fields,
        accessorFn: (t) =>
          sectionsOf(t).reduce(
            (sum, s) => sum + (Array.isArray(s.fields) ? s.fields.length : 0),
            0
          ),
      },
      { id: 'createdBy', header: C.createdBy, accessorFn: (t) => userNameById(users, t.createdBy) },
      createStatusColumn<EcrfTemplate>((t) => t.status, C.status),
    ],
    [users, masterLabel]
  );

  const rowActions = (template: EcrfTemplate): RowAction[] => {
    const actions: RowAction[] = [];
    if (canEdit) {
      actions.push({
        key: 'edit',
        label: L.edit,
        icon: Pencil,
        onClick: () => navigate(paths.ecrfTemplateEdit(template.id)),
      });
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
    createTo: canCreate ? ROUTES.ecrfTemplateNew : undefined,
    columns,
    data: rows,
    getRowId: (t: EcrfTemplate) => t.id,
    rowActions,
    isRowMuted: (t: EcrfTemplate) => t.status !== 'active',
    searchPlaceholder: L.searchPlaceholder,
    emptyTitle: L.emptyTitle,
    emptyDescription: L.emptyDescription,
    itemLabel: L.itemLabel,
    confirm: {
      isOpen: !!pending,
      title: isDeactivating ? L.confirmDeactivateTitle : L.confirmReactivateTitle,
      message: isDeactivating ? L.confirmDeactivate(name) : L.confirmReactivate(name),
      confirmLabel: isDeactivating ? L.deactivate : L.reactivate,
      tone: isDeactivating ? ('danger' as const) : ('primary' as const),
      onConfirm: () => {
        if (!pending) {
          return;
        }
        toggleStatus(pending.id);
        notify.success(isDeactivating ? L.deactivated(name) : L.reactivated(name));
        setPending(null);
      },
      onCancel: () => setPending(null),
    },
  };
}
