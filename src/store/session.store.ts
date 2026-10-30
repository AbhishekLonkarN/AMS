import type { Id, LoginResult, User } from '@/types';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { isSameText } from '@/utils/string.utils';
import { createSessionStore } from './store.config';
import { recordAudit } from './audit.store';
import { useUsersStore } from './users.store';
import { useAffiliationsStore } from './affiliations.store';

interface SessionState {
  currentUserId: Id | null;
  /** Email + any password (dummy auth). */
  login: (email: string) => LoginResult;
  /** Demo user switcher. Same checks and audit as a real login. */
  switchUser: (userId: Id) => LoginResult;
  logout: () => void;
}

function checkCanLogin(user: User): LoginResult {
  if (user.status !== 'active') return { isSuccess: false, error: 'inactive' };
  if (user.userType === 'site') {
    const hasMembership = useAffiliationsStore
      .getState()
      .siteMemberships.some((m) => m.userId === user.id && m.status === 'active');
    if (!hasMembership) return { isSuccess: false, error: 'noActiveMembership' };
  }
  return { isSuccess: true, user };
}

function auditLogin(email: string, isSuccess: boolean) {
  recordAudit({
    page: AUDIT_PAGES.login,
    event: `Log-in attempt ${isSuccess ? 'successful' : 'failed'} for User ${email}`,
    actorEmail: isSuccess ? email : null,
  });
}

export const useSessionStore = createSessionStore<SessionState>('session', (set, get) => {
  const attempt = (email: string, user: User | undefined): LoginResult => {
    const result: LoginResult = user ? checkCanLogin(user) : { isSuccess: false, error: 'notFound' };
    auditLogin(user?.email ?? email.trim(), result.isSuccess);
    if (result.isSuccess) set({ currentUserId: result.user.id });
    return result;
  };

  return {
    currentUserId: null,

    login: (email) => {
      const user = useUsersStore.getState().users.find((u) => isSameText(u.email, email));
      return attempt(email, user);
    },

    switchUser: (userId) => {
      const user = useUsersStore.getState().users.find((u) => u.id === userId);
      return attempt(user?.email ?? userId, user);
    },

    logout: () => {
      if (!get().currentUserId) return;
      recordAudit({ page: AUDIT_PAGES.login, event: 'Logged out' });
      set({ currentUserId: null });
    },
  };
});
