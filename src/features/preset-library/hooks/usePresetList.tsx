import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Eye, Pencil, Trash2 } from 'lucide-react';
import type { Preset } from '@/types';
import { createSrNoColumn, type DataGridColumn, type RowAction } from '@/components/data-grid';
import { notify, usePresetsStore } from '@/store';
import { usePermissionChecker } from '@/rbac';
import { ROUTES, paths } from '@/app/router/route-paths.constants';
import { formatDate } from '@/utils/date.utils';
import {
  PRESET_COLUMNS as C,
  PRESET_LABELS as L,
  PRESET_TYPE_META,
} from '../constants/preset-library.constants';
import { PresetTypeChip, RuleChips } from '../components/PresetBits';
import { errorMessage } from '../utils/preset-errors.utils';
import { ruleSummary } from '../utils/preset-rules.utils';
import styles from '../components/PresetLibrary.module.css';

/** Pre-sets are building blocks of eCRF designs, so they share the eCRF Template rights. */
export function usePresetRights() {
  const can = usePermissionChecker();
  return {
    canCreate: can('ecrfTemplate.new'),
    canEdit: can('ecrfTemplate.edit'),
    canDelete: can('ecrfTemplate.delete'),
  };
}

export function usePresetList() {
  const navigate = useNavigate();
  const { presets, loadState, loadError, load, remove } = usePresetsStore();
  const { canCreate, canEdit, canDelete } = usePresetRights();
  const [pendingDelete, setPendingDelete] = useState<Preset | null>(null);
  // Kept while the dialog closes, so its text doesn't blank out mid-animation.
  const shownDelete = useRef<Preset | null>(null);
  if (pendingDelete) {
    shownDelete.current = pendingDelete;
  }

  // Fetch on every visit so the list shows changes made elsewhere.
  useEffect(() => {
    void load();
  }, [load]);

  const columns = useMemo<DataGridColumn<Preset>[]>(
    () => [
      createSrNoColumn<Preset>(),
      {
        id: 'title',
        header: C.title,
        accessorKey: 'title',
        meta: { className: 'sm:min-w-40 max-w-72' },
        cell: ({ row }) => (
          <span className={styles.titleCell}>
            <button type="button" className={styles.titleLink} onClick={() => navigate(paths.presetView(row.original.id))}>
              {row.original.title}
            </button>
            {/* On phones the Data-field Title column is hidden, so it shows here instead. */}
            <span className={`${styles.titleSub} md:hidden`}>{row.original.fieldTitle}</span>
          </span>
        ),
      },
      { id: 'fieldTitle', header: C.fieldTitle, accessorKey: 'fieldTitle', meta: { isTruncated: true, hideBelow: 'md' } },
      {
        id: 'type',
        header: C.type,
        accessorFn: (p) => PRESET_TYPE_META[p.type].label,
        meta: { filterVariant: 'select', hideBelow: 'sm' },
        cell: ({ row }) => <PresetTypeChip type={row.original.type} />,
      },
      {
        id: 'settings',
        header: C.settings,
        accessorFn: (p) => ruleSummary(p).join(' · '),
        meta: { hideBelow: 'lg' },
        cell: ({ row }) => <RuleChips chips={ruleSummary(row.original)} />,
      },
      { id: 'createdBy', header: C.createdBy, accessorKey: 'createdByName', meta: { hideBelow: 'lg' } },
      { id: 'updatedAt', header: C.updatedAt, accessorFn: (p) => formatDate(p.updatedAt), meta: { hideBelow: 'md', filterVariant: 'none' } },
    ],
    [navigate]
  );

  const rowActions = (preset: Preset): RowAction[] => {
    const actions: RowAction[] = [
      { key: 'view', label: L.view, icon: Eye, onClick: () => navigate(paths.presetView(preset.id)) },
    ];
    if (canEdit) {
      actions.push({ key: 'edit', label: L.edit, icon: Pencil, onClick: () => navigate(paths.presetEdit(preset.id)) });
    }
    if (canCreate) {
      actions.push({ key: 'duplicate', label: L.duplicate, icon: Copy, onClick: () => navigate(paths.presetDuplicate(preset.id)) });
    }
    if (canDelete) {
      actions.push({ key: 'delete', label: L.delete, icon: Trash2, tone: 'danger', onClick: () => setPendingDelete(preset) });
    }
    return actions;
  };

  const confirmDelete = async () => {
    const preset = pendingDelete;
    if (!preset) {
      return;
    }
    setPendingDelete(null);
    try {
      await remove(preset.id);
      notify.success(L.deleted(preset.title));
      // Deleted from its own View drawer: close it, the record is gone.
      navigate(ROUTES.presetLibrary);
    } catch (error) {
      notify.error(errorMessage(error, L.deleteFailed));
    }
  };

  const isFirstLoad = loadState === 'loading' && presets.length === 0;
  const deleteTitle = shownDelete.current?.title ?? '';

  return {
    list: {
      title: L.listTitle,
      description: L.listDescription,
      createLabel: canCreate ? L.addButton : undefined,
      createTo: canCreate ? ROUTES.presetNew : undefined,
      columns,
      data: presets,
      getRowId: (p: Preset) => p.id,
      rowActions,
      searchPlaceholder: L.searchPlaceholder,
      emptyTitle: isFirstLoad ? L.loading : loadState === 'failed' ? L.loadFailed : L.emptyTitle,
      emptyDescription: loadState === 'failed' ? (loadError ?? undefined) : isFirstLoad ? undefined : L.emptyDescription,
      itemLabel: L.itemLabel,
      confirm: {
        isOpen: !!pendingDelete,
        title: L.confirmDeleteTitle,
        message: L.confirmDelete(deleteTitle),
        confirmLabel: L.delete,
        tone: 'danger' as const,
        onConfirm: () => void confirmDelete(),
        onCancel: () => setPendingDelete(null),
      },
    },
    requestDelete: setPendingDelete,
  };
}
