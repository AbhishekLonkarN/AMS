import type { Id, RecordStatus, User, UserType } from '@/types';
import { USERS_SEED } from '@/data/users.seed';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { ACCOUNT_TYPE_LABELS } from '@/constants/user.constants';
import { createId } from '@/utils/id.utils';
import { nowIso } from '@/utils/date.utils';
import { createAppStore } from './store.config';
import { statusText } from '@/utils/status.utils';
import { recordAudit, recordFieldChanges, recordPermissionChange, type AuditField } from './audit.store';
import { useSessionStore } from './session.store';
import { useAccessRightsStore } from './access-rights.store';

export type NewUserInput = Omit<User, 'id' | 'createdAt' | 'createdBy'>;

interface UsersState {
  users: User[];
  addUser: (input: NewUserInput) => User;
  updateUser: (id: Id, patch: Partial<NewUserInput>) => void;
  setUserStatus: (id: Id, status: RecordStatus) => void;
}

const PAGE_BY_TYPE: Record<UserType, string> = {
  admin: AUDIT_PAGES.adminUsers,
  sponsor: AUDIT_PAGES.sponsorCoUsers,
  co: AUDIT_PAGES.sponsorCoUsers,
  site: AUDIT_PAGES.siteUsers,
};

// Store read inside the function (not at import time) so the store import cycle stays safe.
const templateName = (id?: string) => useAccessRightsStore.getState().templates.find((t) => t.id === id)?.name ?? '—';

const USER_AUDIT_FIELDS: AuditField<User>[] = [
  { key: 'prefix', label: 'Prefix' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'organization', label: 'Organization' },
  { key: 'accountType', label: 'Account type', format: (v) => ACCOUNT_TYPE_LABELS[v as 'sponsor'] ?? '—' },
  { key: 'status', label: 'Status', format: statusText },
  { key: 'globalTemplateId', label: 'Default Access Rights Set', format: (id) => templateName(id) },
];

export const useUsersStore = createAppStore<UsersState>('users', (set, get) => ({
  users: USERS_SEED,

  addUser: (input) => {
    const user: User = {
      ...input,
      id: createId('usr'),
      createdAt: nowIso(),
      createdBy: useSessionStore.getState().currentUserId ?? undefined,
    };
    set((s) => ({ users: [...s.users, user] }));
    recordAudit({ page: PAGE_BY_TYPE[user.userType], event: `Created user ${user.email}`, changedTo: user.email });
    if (user.globalGrant?.length) {
      recordPermissionChange({ page: PAGE_BY_TYPE[user.userType], subject: user.email, before: [], after: user.globalGrant });
    }
    return user;
  },

  updateUser: (id, patch) => {
    const before = get().users.find((u) => u.id === id);
    if (!before) return;
    const after: User = { ...before, ...patch };
    set((s) => ({ users: s.users.map((u) => (u.id === id ? after : u)) }));

    const page = PAGE_BY_TYPE[before.userType];
    recordFieldChanges({ page, subject: `user ${before.email}`, before, after, fields: USER_AUDIT_FIELDS });
    if (patch.globalGrant) {
      recordPermissionChange({ page, subject: after.email, before: before.globalGrant ?? [], after: after.globalGrant ?? [] });
    }
  },

  setUserStatus: (id, status) => {
    const user = get().users.find((u) => u.id === id);
    if (!user || user.status === status) return;
    set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, status } : u)) }));
    recordAudit({
      page: PAGE_BY_TYPE[user.userType],
      event: `${status === 'active' ? 'Re-activated' : 'Deactivated'} user ${user.email}`,
      originalValue: statusText(user.status),
      changedTo: statusText(status),
    });
  },
}));
