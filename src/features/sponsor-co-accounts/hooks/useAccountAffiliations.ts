import { useMemo } from 'react';
import type { User } from '@/types';
import { useAffiliationsStore, useProjectsStore, useSitesStore } from '@/store';

/** Active affiliations of a sponsor (projects) or CO (sites) account, as labels. */
export function useAccountAffiliations(user: User | undefined) {
  const { sponsorAffiliations, coAffiliations } = useAffiliationsStore();
  const projects = useProjectsStore((s) => s.projects);
  const sites = useSitesStore((s) => s.sites);

  return useMemo(() => {
    if (!user) return [];
    const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? id;

    if (user.accountType === 'sponsor') {
      return sponsorAffiliations
        .filter((a) => a.userId === user.id && a.status === 'active')
        .map((a) => `${projectName(a.projectId)} (${a.designation})`);
    }
    return coAffiliations
      .filter((a) => a.userId === user.id && a.status === 'active')
      .map((a) => {
        const site = sites.find((s) => s.id === a.siteId);
        return `${projectName(a.projectId)} · ${site?.siteCode ?? a.siteId} (${a.designation})`;
      });
  }, [user, sponsorAffiliations, coAffiliations, projects, sites]);
}
