import type { Id, LoginErrorCode, LoginResult, User } from '@/types';
import { loginRequest, setRequestHeaders } from '@/api';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { isSameText } from '@/utils/string.utils';
import { createSessionStore } from './store.config';
import { recordAudit } from './audit.store';
import { useUsersStore } from './users.store';
import { useAffiliationsStore } from './affiliations.store';

interface SessionState {
  currentUserId: Id | null;
  /** The backend checks email + password; the user's data comes from the prototype stores. */
  login: (email: string, password: string) => Promise<LoginResult>;
  /** Demo user switcher. Same checks and audit as a real login. */
  switchUser: (userId: Id) => LoginResult;
  logout: () => void;
}

function checkCanLogin(user: User): LoginResult {
  if (user.status !== 'active') {return { isSuccess: false, error: 'inactive' };}
  if (user.userType === 'site') {
    const hasMembership = useAffiliationsStore
      .getState()
      .siteMemberships.some((m) => m.userId === user.id && m.status === 'active');
    if (!hasMembership) {return { isSuccess: false, error: 'noActiveMembership' };}
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
  const attempt = (email: string, user: User | undefined, missingError: LoginErrorCode = 'notFound'): LoginResult => {
    const result: LoginResult = user ? checkCanLogin(user) : { isSuccess: false, error: missingError };
    auditLogin(user?.email ?? email.trim(), result.isSuccess);
    if (result.isSuccess) {set({ currentUserId: result.user.id });}
    return result;
  };

  return {
    currentUserId: null,

    login: async (email, password) => {
      const backend = await loginRequest(email, password);
      if (!backend.isSuccess) {
        auditLogin(email.trim(), false);
        return backend;
      }
      const user = useUsersStore.getState().users.find((u) => isSameText(u.email, backend.user.email));
      return attempt(backend.user.email, user, 'notInDemoData');
    },

    switchUser: (userId) => {
      const user = useUsersStore.getState().users.find((u) => u.id === userId);
      return attempt(user?.email ?? userId, user);
    },

    logout: () => {
      if (!get().currentUserId) {return;}
      recordAudit({ page: AUDIT_PAGES.login, event: 'Logged out' });
      set({ currentUserId: null });
    },
  };
});

// Read at request time, so it follows logins, the demo switcher and page reloads.
setRequestHeaders((): Record<string, string> => {
  const userId = useSessionStore.getState().currentUserId;
  const email = useUsersStore.getState().users.find((u) => u.id === userId)?.email;
  return email ? { 'X-Dev-User-Email': email } : {};
});
