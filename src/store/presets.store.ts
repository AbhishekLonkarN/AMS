import { create } from 'zustand';
import type { Id, Preset, PresetInput } from '@/types';
import { ApiError, createPreset, deletePreset, listPresets, updatePreset } from '@/api';
import type { LoadState } from './access-rights-sets.store';

interface PresetsState {
  /** Newest first, as the backend lists them. */
  presets: Preset[];
  loadState: LoadState;
  loadError: string | null;
  /** Fetches every pre-set again. */
  load: () => Promise<void>;
  /** The mutations throw `ApiError`; the backend writes the audit trail. */
  add: (input: PresetInput) => Promise<Preset>;
  update: (id: Id, input: PresetInput) => Promise<Preset>;
  remove: (id: Id) => Promise<void>;
}

/** Pre-set Data-field Library from the backend. Server data, so never persisted. */
export const usePresetsStore = create<PresetsState>((set) => ({
  presets: [],
  loadState: 'idle',
  loadError: null,

  load: async () => {
    set({ loadState: 'loading', loadError: null });
    try {
      set({ presets: await listPresets(), loadState: 'loaded' });
    } catch (error) {
      set({ loadState: 'failed', loadError: error instanceof ApiError ? error.message : String(error) });
    }
  },

  add: async (input) => {
    const saved = await createPreset(input);
    set((s) => ({ presets: [saved, ...s.presets.filter((p) => p.id !== saved.id)] }));
    return saved;
  },

  update: async (id, input) => {
    const saved = await updatePreset(id, input);
    set((s) => ({ presets: s.presets.map((p) => (p.id === id ? saved : p)) }));
    return saved;
  },

  remove: async (id) => {
    await deletePreset(id);
    set((s) => ({ presets: s.presets.filter((p) => p.id !== id) }));
  },
}));
