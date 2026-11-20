import { create } from 'zustand';
import type { Id, MasterItem } from '@/types';
import {
  ApiError,
  createProductGroup,
  listProductGroups,
  setProductGroupActive,
  updateProductGroup,
  type ProductGroupInput,
} from '@/api';
import type { LoadState } from './access-rights-sets.store';

interface ProductGroupsState {
  groups: MasterItem[];
  loadState: LoadState;
  loadError: string | null;
  /** Fetches every group again. */
  load: () => Promise<void>;
  /** The mutations throw `ApiError`; the backend writes the audit trail. */
  add: (input: ProductGroupInput) => Promise<MasterItem>;
  update: (id: Id, input: Partial<ProductGroupInput>) => Promise<MasterItem>;
  setActive: (id: Id, isActive: boolean) => Promise<MasterItem>;
}

const byCode = (a: MasterItem, b: MasterItem) => a.label.localeCompare(b.label);

/** Master-Product Group values from the backend. Server data, so never persisted. */
export const useProductGroupsStore = create<ProductGroupsState>((set) => {
  const upsert = (saved: MasterItem) => {
    set((s) => ({ groups: [...s.groups.filter((g) => g.id !== saved.id), saved].sort(byCode) }));
    return saved;
  };

  return {
    groups: [],
    loadState: 'idle',
    loadError: null,

    load: async () => {
      set({ loadState: 'loading', loadError: null });
      try {
        set({ groups: (await listProductGroups()).sort(byCode), loadState: 'loaded' });
      } catch (error) {
        set({ loadState: 'failed', loadError: error instanceof ApiError ? error.message : String(error) });
      }
    },

    add: async (input) => upsert(await createProductGroup(input)),
    update: async (id, input) => upsert(await updateProductGroup(id, input)),
    setActive: async (id, isActive) => upsert(await setProductGroupActive(id, isActive)),
  };
});
