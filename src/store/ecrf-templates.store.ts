import { create } from 'zustand';
import type { FormBuilderConfig } from '@/components/dynamic-form';
import type { EcrfDesign, EcrfTemplate, Id } from '@/types';
import {
  ApiError,
  createEcrfTemplate,
  deleteEcrfTemplate,
  listEcrfTemplates,
  publishEcrfTemplateDesign,
  saveEcrfTemplateDesign,
  setEcrfTemplateActive,
  updateEcrfTemplate,
  type EcrfTemplateCreateInput,
  type EcrfTemplateDetailsInput,
} from '@/api';
import type { LoadState } from './access-rights-sets.store';

interface EcrfTemplatesState {
  /** Newest first, as the backend lists them. */
  templates: EcrfTemplate[];
  loadState: LoadState;
  loadError: string | null;
  /** Fetches every template again. */
  load: () => Promise<void>;
  /** The mutations throw `ApiError`; the backend writes the audit trail. */
  create: (input: EcrfTemplateCreateInput) => Promise<EcrfTemplate>;
  updateDetails: (id: Id, input: EcrfTemplateDetailsInput) => Promise<EcrfTemplate>;
  setActive: (id: Id, isActive: boolean) => Promise<EcrfTemplate>;
  saveDesign: (id: Id, config: FormBuilderConfig, draftRevision: number | null) => Promise<EcrfDesign>;
  publish: (id: Id) => Promise<EcrfDesign>;
  remove: (id: Id) => Promise<void>;
}

/** eCRF templates from the backend. Server data, so never persisted. */
export const useEcrfTemplatesStore = create<EcrfTemplatesState>((set) => {
  const upsert = (saved: EcrfTemplate) => {
    set((s) =>
      s.templates.some((t) => t.id === saved.id)
        ? { templates: s.templates.map((t) => (t.id === saved.id ? saved : t)) }
        : { templates: [saved, ...s.templates] },
    );
    return saved;
  };
  const patch = (id: Id, changes: Partial<EcrfTemplate>) =>
    set((s) => ({ templates: s.templates.map((t) => (t.id === id ? { ...t, ...changes } : t)) }));

  return {
    templates: [],
    loadState: 'idle',
    loadError: null,

    load: async () => {
      set({ loadState: 'loading', loadError: null });
      try {
        set({ templates: await listEcrfTemplates(), loadState: 'loaded' });
      } catch (error) {
        set({ loadState: 'failed', loadError: error instanceof ApiError ? error.message : String(error) });
      }
    },

    create: async (input) => upsert(await createEcrfTemplate(input)),
    updateDetails: async (id, input) => upsert(await updateEcrfTemplate(id, input)),
    setActive: async (id, isActive) => upsert(await setEcrfTemplateActive(id, isActive)),

    saveDesign: async (id, config, draftRevision) => {
      const design = await saveEcrfTemplateDesign(id, config, draftRevision);
      patch(id, { hasDraft: true });
      return design;
    },

    publish: async (id) => {
      const design = await publishEcrfTemplateDesign(id);
      patch(id, { hasDraft: false, publishedVersionNo: design.versionNo });
      return design;
    },

    remove: async (id) => {
      await deleteEcrfTemplate(id);
      set((s) => ({ templates: s.templates.filter((t) => t.id !== id) }));
    },
  };
});
