import type { AccessRightsTemplate, Id } from '@/types';
import { ACCESS_RIGHTS_TEMPLATES_SEED } from '@/data/access-rights.seed';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { USER_TYPE_LABELS } from '@/constants/user.constants';
import { createId } from '@/utils/id.utils';
import { nowIso } from '@/utils/date.utils';
import { createAppStore } from './store.config';
import { statusText } from '@/utils/status.utils';
import { recordAudit, recordFieldChanges, recordPermissionChange, type AuditField } from './audit.store';
import { useSessionStore } from './session.store';

export type TemplateInput = Pick<AccessRightsTemplate, 'name' | 'userType' | 'permissions' | 'status'>;

interface AccessRightsState {
  templates: AccessRightsTemplate[];
  addTemplate: (input: TemplateInput) => AccessRightsTemplate;
  updateTemplate: (id: Id, input: TemplateInput) => void;
  toggleTemplateStatus: (id: Id) => void;
}

const TEMPLATE_AUDIT_FIELDS: AuditField<AccessRightsTemplate>[] = [
  { key: 'name', label: 'Access Rights Set' },
  { key: 'userType', label: 'User type', format: (v) => USER_TYPE_LABELS[v as 'admin'] },
  { key: 'status', label: 'Status', format: statusText },
];

const PAGE = AUDIT_PAGES.accessRights;

export const useAccessRightsStore = createAppStore<AccessRightsState>('access-rights', (set, get) => ({
  templates: ACCESS_RIGHTS_TEMPLATES_SEED,

  addTemplate: (input) => {
    const template: AccessRightsTemplate = {
      ...input,
      id: createId('tpl'),
      createdBy: useSessionStore.getState().currentUserId ?? '',
      createdAt: nowIso(),
    };
    set((s) => ({ templates: [...s.templates, template] }));
    recordAudit({ page: PAGE, event: `Created access rights set ${template.name}`, changedTo: template.name });
    recordPermissionChange({ page: PAGE, subject: `set ${template.name}`, before: [], after: template.permissions });
    return template;
  },

  updateTemplate: (id, input) => {
    const before = get().templates.find((t) => t.id === id);
    if (!before) return;
    const after = { ...before, ...input };
    set((s) => ({ templates: s.templates.map((t) => (t.id === id ? after : t)) }));
    const subject = `access rights set ${before.name}`;
    recordFieldChanges({ page: PAGE, subject, before, after, fields: TEMPLATE_AUDIT_FIELDS });
    recordPermissionChange({ page: PAGE, subject, before: before.permissions, after: after.permissions });
  },

  toggleTemplateStatus: (id) => {
    const template = get().templates.find((t) => t.id === id);
    if (!template) return;
    const status = template.status === 'active' ? 'inactive' : 'active';
    set((s) => ({ templates: s.templates.map((t) => (t.id === id ? { ...t, status } : t)) }));
    recordAudit({
      page: PAGE,
      event: `${status === 'active' ? 'Re-activated' : 'Deactivated'} access rights set ${template.name}`,
      originalValue: statusText(template.status),
      changedTo: statusText(status),
    });
  },
}));
