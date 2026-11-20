import { create } from 'zustand';
import type { AccessRightsSet, AccessRightsSetInput, Id } from '@/types';
import {
  ApiError,
  createAccessRightsSet,
  listAccessRightsSets,
  setAccessRightsSetActive,
  updateAccessRightsSet,
} from '@/api';

export type LoadState = 'idle' | 'loading' | 'loaded' | 'failed';

interface AccessRightsSetsState {
  sets: AccessRightsSet[];
  loadState: LoadState;
  loadError: string | null;
  /** Fetches every set again. */
  load: () => Promise<void>;
  /** The mutations throw `ApiError`; the backend writes the audit trail. */
  add: (input: AccessRightsSetInput) => Promise<AccessRightsSet>;
  update: (id: Id, input: AccessRightsSetInput) => Promise<AccessRightsSet>;
  setActive: (id: Id, isActive: boolean) => Promise<AccessRightsSet>;
}

const byName = (a: AccessRightsSet, b: AccessRightsSet) => a.name.localeCompare(b.name);

/**
 * Default Access Rights sets from the backend, for the Masters screen only. The user forms
 * still read the demo sets in `access-rights.store`. Server data, so never persisted.
 */
export const useAccessRightsSetsStore = create<AccessRightsSetsState>((set) => {
  const upsert = (saved: AccessRightsSet) => {
    set((s) => ({ sets: [...s.sets.filter((x) => x.id !== saved.id), saved].sort(byName) }));
    return saved;
  };

  return {
    sets: [],
    loadState: 'idle',
    loadError: null,

    load: async () => {
      set({ loadState: 'loading', loadError: null });
      try {
        set({ sets: await listAccessRightsSets(), loadState: 'loaded' });
      } catch (error) {
        set({ loadState: 'failed', loadError: error instanceof ApiError ? error.message : String(error) });
      }
    },

    add: async (input) => upsert(await createAccessRightsSet(input)),
    update: async (id, input) => upsert(await updateAccessRightsSet(id, input)),
    setActive: async (id, isActive) => upsert(await setAccessRightsSetActive(id, isActive)),
  };
});
