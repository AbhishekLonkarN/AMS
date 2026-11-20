import { useEffect, useMemo } from 'react';
import type { MasterItem, MasterKey } from '@/types';
import { useMastersStore, useProductGroupsStore, type MasterItemInput } from '@/store';
import { MASTER_LABELS as L } from '../constants/masters.constants';

/** Reads and writes one master, wherever it is kept. Writes may throw `ApiError`. */
export interface MasterSource {
  items: MasterItem[];
  /** Shown in the empty grid while loading or after a failed load. */
  emptyTitle?: string;
  emptyDescription?: string;
  add: (input: MasterItemInput) => Promise<void>;
  update: (item: MasterItem, input: MasterItemInput) => Promise<void>;
  setActive: (item: MasterItem, isActive: boolean) => Promise<void>;
}

/** Product Group lives in the backend; the other masters are still demo data in the browser. */
const isRemote = (masterKey: MasterKey) => masterKey === 'productGroup';

/** The items of one master. Starts loading Product Group from the backend if it isn't loaded yet. */
export function useMasterItems(masterKey: MasterKey): MasterItem[] {
  const localItems = useMastersStore((s) => s.items);
  const groups = useProductGroupsStore((s) => s.groups);
  const groupsLoadState = useProductGroupsStore((s) => s.loadState);
  const loadGroups = useProductGroupsStore((s) => s.load);
  const remote = isRemote(masterKey);

  useEffect(() => {
    if (remote && groupsLoadState === 'idle') {
      void loadGroups();
    }
  }, [remote, groupsLoadState, loadGroups]);

  return useMemo(
    () => (remote ? groups : localItems.filter((i) => i.masterKey === masterKey)),
    [remote, groups, localItems, masterKey],
  );
}

export function useMasterSource(masterKey: MasterKey): MasterSource {
  const local = useMastersStore();
  const remote = useProductGroupsStore();
  const isProductGroup = isRemote(masterKey);
  const localItems = local.items;
  const items = useMemo(
    () => (isProductGroup ? remote.groups : localItems.filter((i) => i.masterKey === masterKey)),
    [isProductGroup, remote.groups, localItems, masterKey],
  );

  // The master screen always shows fresh values (the dropdowns reuse what is already loaded).
  const loadGroups = remote.load;
  useEffect(() => {
    if (isProductGroup) {
      void loadGroups();
    }
  }, [isProductGroup, loadGroups]);

  if (!isProductGroup) {
    return {
      items,
      add: async (input) => {
        local.addMasterItem(masterKey, input);
      },
      update: async (item, input) => local.updateMasterItem(item.id, input),
      setActive: async (item) => local.toggleMasterItemStatus(item.id),
    };
  }

  return {
    items,
    emptyTitle: remote.loadState === 'loading' ? L.loading : remote.loadState === 'failed' ? L.loadFailed : undefined,
    emptyDescription: remote.loadState === 'failed' ? (remote.loadError ?? undefined) : undefined,
    // The backend creates groups active, so an inactive one is created, then deactivated.
    add: async (input) => {
      const created = await remote.add({ code: input.label, description: input.description });
      if (input.status === 'inactive') {
        await remote.setActive(created.id, false);
      }
    },
    // Only changed values are sent, so the audit trail records only real changes.
    update: async (item, input) => {
      const changes = {
        code: input.label !== item.label ? input.label : undefined,
        description: input.description !== item.description ? input.description : undefined,
      };
      if (changes.code !== undefined || changes.description !== undefined) {
        await remote.update(item.id, changes);
      }
      if (input.status !== item.status) {
        await remote.setActive(item.id, input.status === 'active');
      }
    },
    setActive: async (item, isActive) => {
      await remote.setActive(item.id, isActive);
    },
  };
}
