import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ban, Pencil, RotateCcw, Send, Trash2 } from 'lucide-react';
import type { EcrfTemplate } from '@/types';
import {
  createSrNoColumn,
  createStatusColumn,
  type DataGridColumn,
  type RowAction,
} from '@/components/data-grid';
import { notify, useEcrfTemplatesStore } from '@/store';
import { usePermissionChecker } from '@/rbac';
import { ROUTES, paths } from '@/app/router/route-paths.constants';
import {
  ECRF_TEMPLATE_COLUMNS as C,
  ECRF_TEMPLATE_LABELS as L,
} from '../constants/ecrf-templates.constants';
import { templateErrorMessage } from '../utils/ecrf-template-errors.utils';

type PendingAction = { kind: 'toggle' | 'publish' | 'delete'; template: EcrfTemplate };

const versionText = (t: EcrfTemplate) => {
  if (t.publishedVersionNo === null) {
    return L.versionUnpublished;
  }
  return t.hasDraft ? L.versionWithDraft(t.publishedVersionNo) : L.versionPublished(t.publishedVersionNo);
};

export function useEcrfTemplateList() {
  const navigate = useNavigate();
  const { templates, loadState, loadError, load, setActive, publish, remove } = useEcrfTemplatesStore();
  const can = usePermissionChecker();
  const [pending, setPending] = useState<PendingAction | null>(null);

  // Fetch on every visit so the list shows changes made elsewhere.
  useEffect(() => {
    void load();
  }, [load]);

  const canCreate = can('ecrfTemplate.new');
  const canEdit = can('ecrfTemplate.edit');
  // Activate / Deactivate and Publish require Edit (SCR-SPN-10).
  const canToggle = canEdit;
  const canDelete = can('ecrfTemplate.delete');

  const columns = useMemo<DataGridColumn<EcrfTemplate>[]>(
    () => [
      createSrNoColumn<EcrfTemplate>(),
      { id: 'name', header: C.name, accessorKey: 'name', meta: { className: 'font-medium sm:min-w-36' } },
      {
        id: 'productGroup',
        header: C.productGroup,
        accessorKey: 'productGroupCode',
        meta: { filterVariant: 'select', hideBelow: 'sm' },
      },
      {
        id: 'suitableFor',
        header: C.suitableFor,
        accessorKey: 'suitableFor',
        meta: { isTruncated: true, hideBelow: 'lg' },
      },
      { id: 'version', header: C.version, accessorFn: versionText, meta: { hideBelow: 'md' } },
      { id: 'createdBy', header: C.createdBy, accessorKey: 'createdByName', meta: { hideBelow: 'lg' } },
      createStatusColumn<EcrfTemplate>((t) => t.status, C.status),
    ],
    []
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
      // Only saved, unpublished changes can be published.
      if (template.hasDraft) {
        actions.push({
          key: 'publish',
          label: L.publish,
          icon: Send,
          onClick: () => setPending({ kind: 'publish', template }),
        });
      }
    }
    if (canToggle) {
      const isActive = template.status === 'active';
      actions.push({
        key: 'toggle',
        label: isActive ? L.deactivate : L.reactivate,
        icon: isActive ? Ban : RotateCcw,
        tone: isActive ? 'danger' : 'default',
        onClick: () => setPending({ kind: 'toggle', template }),
      });
    }
    if (canDelete) {
      actions.push({
        key: 'delete',
        label: L.delete,
        icon: Trash2,
        tone: 'danger',
        onClick: () => setPending({ kind: 'delete', template }),
      });
    }
    return actions;
  };

  const run = async ({ kind, template }: PendingAction) => {
    const { name } = template;
    try {
      if (kind === 'publish') {
        const design = await publish(template.id);
        notify.success(L.published(name, design.versionNo));
      } else if (kind === 'delete') {
        await remove(template.id);
        notify.success(L.deleted(name));
      } else {
        const isDeactivating = template.status === 'active';
        await setActive(template.id, !isDeactivating);
        notify.success(isDeactivating ? L.deactivated(name) : L.reactivated(name));
      }
    } catch (error) {
      notify.error(templateErrorMessage(error));
    }
  };

  const confirmText = (action: PendingAction) => {
    const { name } = action.template;
    if (action.kind === 'publish') {
      return { title: L.confirmPublishTitle, message: L.confirmPublish(name), confirmLabel: L.publish, tone: 'primary' as const };
    }
    if (action.kind === 'delete') {
      return { title: L.confirmDeleteTitle, message: L.confirmDelete(name), confirmLabel: L.delete, tone: 'danger' as const };
    }
    return action.template.status === 'active'
      ? { title: L.confirmDeactivateTitle, message: L.confirmDeactivate(name), confirmLabel: L.deactivate, tone: 'danger' as const }
      : { title: L.confirmReactivateTitle, message: L.confirmReactivate(name), confirmLabel: L.reactivate, tone: 'primary' as const };
  };

  const isLoading = loadState === 'loading' && templates.length === 0;

  return {
    title: L.listTitle,
    description: L.listDescription,
    createLabel: canCreate ? L.addButton : undefined,
    createTo: canCreate ? ROUTES.ecrfTemplateNew : undefined,
    columns,
    data: templates,
    getRowId: (t: EcrfTemplate) => t.id,
    rowActions,
    isRowMuted: (t: EcrfTemplate) => t.status !== 'active',
    searchPlaceholder: L.searchPlaceholder,
    emptyTitle: isLoading ? L.loading : loadState === 'failed' ? L.loadFailed : L.emptyTitle,
    emptyDescription: loadState === 'failed' ? (loadError ?? undefined) : isLoading ? undefined : L.emptyDescription,
    itemLabel: L.itemLabel,
    confirm: {
      isOpen: !!pending,
      ...(pending ? confirmText(pending) : { title: '', message: '', confirmLabel: '', tone: 'primary' as const }),
      onConfirm: () => {
        if (pending) {
          setPending(null);
          void run(pending);
        }
      },
      onCancel: () => setPending(null),
    },
  };
}
