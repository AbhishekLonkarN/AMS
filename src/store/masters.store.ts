import type { Id, MasterItem, MasterKey } from '@/types';
import { MASTERS_SEED } from '@/data/masters.seed';
import { MASTER_META } from '@/constants/master.constants';
import { createId } from '@/utils/id.utils';
import { nowIso } from '@/utils/date.utils';
import { createAppStore } from './store.config';
import { statusText } from '@/utils/status.utils';
import { recordAudit, recordFieldChanges, type AuditField } from './audit.store';
import { useSessionStore } from './session.store';

export type MasterItemInput = Pick<MasterItem, 'label' | 'description' | 'status'>;

interface MastersState {
  items: MasterItem[];
  addMasterItem: (masterKey: MasterKey, input: MasterItemInput) => MasterItem;
  updateMasterItem: (id: Id, input: MasterItemInput) => void;
  toggleMasterItemStatus: (id: Id) => void;
}

const MASTER_AUDIT_FIELDS: AuditField<MasterItem>[] = [
  { key: 'label', label: 'Name' },
  { key: 'description', label: 'Description' },
  { key: 'status', label: 'Status', format: statusText },
];

export const useMastersStore = createAppStore<MastersState>('masters', (set, get) => ({
  items: MASTERS_SEED,

  addMasterItem: (masterKey, input) => {
    const item: MasterItem = {
      ...input,
      id: createId('ms'),
      masterKey,
      createdBy: useSessionStore.getState().currentUserId ?? undefined,
      updatedAt: nowIso(),
    };
    set((s) => ({ items: [...s.items, item] }));
    const meta = MASTER_META[masterKey];
    recordAudit({ page: meta.title, event: `Created ${meta.itemName} ${item.label}`, changedTo: item.label });
    return item;
  },

  updateMasterItem: (id, input) => {
    const before = get().items.find((i) => i.id === id);
    if (!before) return;
    const after: MasterItem = { ...before, ...input, updatedAt: nowIso() };
    set((s) => ({ items: s.items.map((i) => (i.id === id ? after : i)) }));
    const meta = MASTER_META[before.masterKey];
    recordFieldChanges({
      page: meta.title,
      subject: `${meta.itemName} ${before.label}`,
      before,
      after,
      fields: MASTER_AUDIT_FIELDS,
    });
  },

  toggleMasterItemStatus: (id) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) return;
    const status = item.status === 'active' ? 'inactive' : 'active';
    set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, status, updatedAt: nowIso() } : i)) }));
    const meta = MASTER_META[item.masterKey];
    recordAudit({
      page: meta.title,
      event: `${status === 'active' ? 'Re-activated' : 'Deactivated'} ${meta.itemName} ${item.label}`,
      originalValue: statusText(item.status),
      changedTo: statusText(status),
    });
  },
}));
