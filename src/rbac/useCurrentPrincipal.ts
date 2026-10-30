import { useMemo } from 'react';
import type { Principal } from '@/types';
import { useAffiliationsStore, useSessionStore, useUsersStore } from '@/store';
import { buildGrants } from './can.utils';

/** Current user + effective grants. Re-computes whenever users or affiliations change. */
export function useCurrentPrincipal(): Principal | null {
  const userId = useSessionStore((s) => s.currentUserId);
  const users = useUsersStore((s) => s.users);
  const sponsorAffiliations = useAffiliationsStore((s) => s.sponsorAffiliations);
  const coAffiliations = useAffiliationsStore((s) => s.coAffiliations);
  const siteMemberships = useAffiliationsStore((s) => s.siteMemberships);

  return useMemo(() => {
    const user = users.find((u) => u.id === userId);
    if (!user) return null;
    return { user, grants: buildGrants(user, { sponsorAffiliations, coAffiliations, siteMemberships }) };
  }, [userId, users, sponsorAffiliations, coAffiliations, siteMemberships]);
}
