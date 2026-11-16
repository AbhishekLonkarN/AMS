import type { EcrfTemplate, Id } from '@/types';
import { ECRF_TEMPLATES_SEED } from '@/data/ecrf-templates.seed';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { createId } from '@/utils/id.utils';
import { nowIso } from '@/utils/date.utils';
import { statusText } from '@/utils/status.utils';
import { createAppStore } from './store.config';
import { recordAudit } from './audit.store';
import { useSessionStore } from './session.store';

export type EcrfTemplateInput = Pick<EcrfTemplate, 'name' | 'productGroupId' | 'description' | 'status' | 'config'>;

interface EcrfTemplatesState {
  templates: EcrfTemplate[];
  addEcrfTemplate: (input: EcrfTemplateInput) => EcrfTemplate;
  updateEcrfTemplate: (id: Id, input: EcrfTemplateInput) => void;
  toggleEcrfTemplateStatus: (id: Id) => void;
}

/** Stands in for the eCRF template API: the form config is stored as-is, as JSON. */
export const useEcrfTemplatesStore = createAppStore<EcrfTemplatesState>('ecrf-templates', (set, get) => ({
  templates: ECRF_TEMPLATES_SEED,

  addEcrfTemplate: (input) => {
    const template: EcrfTemplate = {
      ...input,
      id: createId('ecrf'),
      createdBy: useSessionStore.getState().currentUserId ?? undefined,
      updatedAt: nowIso(),
    };
    set((s) => ({ templates: [...s.templates, template] }));
    recordAudit({ page: AUDIT_PAGES.ecrfTemplates, event: `Created eCRF template ${template.name}`, changedTo: template.name });
    return template;
  },

  updateEcrfTemplate: (id, input) => {
    const before = get().templates.find((t) => t.id === id);
    if (!before) {
      return;
    }
    set((s) => ({ templates: s.templates.map((t) => (t.id === id ? { ...t, ...input, updatedAt: nowIso() } : t)) }));
    recordAudit({ page: AUDIT_PAGES.ecrfTemplates, event: `Edited eCRF template ${input.name}` });
  },

  toggleEcrfTemplateStatus: (id) => {
    const template = get().templates.find((t) => t.id === id);
    if (!template) {
      return;
    }
    const status = template.status === 'active' ? 'inactive' : 'active';
    set((s) => ({ templates: s.templates.map((t) => (t.id === id ? { ...t, status, updatedAt: nowIso() } : t)) }));
    recordAudit({
      page: AUDIT_PAGES.ecrfTemplates,
      event: `${status === 'active' ? 'Activated' : 'Deactivated'} eCRF template ${template.name}`,
      originalValue: statusText(template.status),
      changedTo: statusText(status),
    });
  },
}));
