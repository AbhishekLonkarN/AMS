import { useMemo } from 'react';
import { useAffiliationsStore, useUsersStore } from '@/store';

/** How many users / active assignments reference each template (template id → count). */
export function useTemplateUsage(): Map<string, number> {
  const users = useUsersStore((s) => s.users);
  const { sponsorAffiliations, coAffiliations, siteMemberships } = useAffiliationsStore();

  return useMemo(() => {
    const counts = new Map<string, number>();
    const bump = (id?: string) => id && counts.set(id, (counts.get(id) ?? 0) + 1);
    users.forEach((u) => bump(u.globalTemplateId));
    [...sponsorAffiliations, ...coAffiliations]
      .filter((a) => a.status === 'active')
      .forEach((a) => bump(a.templateId));
    siteMemberships.filter((m) => m.status === 'active').forEach((m) => bump(m.templateId));
    return counts;
  }, [users, sponsorAffiliations, coAffiliations, siteMemberships]);
}
