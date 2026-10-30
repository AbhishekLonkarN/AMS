import { useMemo } from 'react';
import type { Id } from '@/types';
import { useProjectsStore, useSitesStore } from '@/store';
import { getAccessibleProjectIds, getAccessibleSiteIds } from './access-scope.utils';
import { useCurrentPrincipal } from './useCurrentPrincipal';

export function useAccessibleProjects() {
  const principal = useCurrentPrincipal();
  const projects = useProjectsStore((s) => s.projects);
  return useMemo(() => {
    const ids = getAccessibleProjectIds(principal);
    return projects.filter((p) => ids.has(p.id));
  }, [principal, projects]);
}

/** Accessible sites, optionally limited to one project. */
export function useAccessibleSites(projectId?: Id) {
  const principal = useCurrentPrincipal();
  const sites = useSitesStore((s) => s.sites);
  return useMemo(() => {
    const ids = getAccessibleSiteIds(principal, sites);
    return sites.filter((s) => ids.has(s.id) && (!projectId || s.projectId === projectId));
  }, [principal, sites, projectId]);
}
