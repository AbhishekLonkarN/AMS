import { useMemo } from 'react';
import { useAffiliationsStore, useProjectsStore } from '@/store';
import { useAccessibleSites, useCurrentPrincipal } from '@/rbac';
import { paths } from '@/app/router/route-paths.constants';

export interface ContextOption {
  siteId: string;
  projectName: string;
  siteCode: string;
  siteName: string;
  location: string;
  investigator: string;
  designation?: string;
  to: string;
}

export interface ContextGroup {
  projectId: string;
  projectName: string;
  options: ContextOption[];
}

/** Sites the user can enter, grouped by project, with their designation at each. */
export function useContextPicker(): ContextGroup[] {
  const principal = useCurrentPrincipal();
  const sites = useAccessibleSites();
  const projects = useProjectsStore((s) => s.projects);
  const { coAffiliations, siteMemberships } = useAffiliationsStore();

  return useMemo(() => {
    const userId = principal?.user.id;
    const assignments = [...coAffiliations, ...siteMemberships].filter(
      (a) => a.userId === userId && a.status === 'active',
    );

    const groups = new Map<string, ContextGroup>();
    for (const site of sites) {
      const projectName = projects.find((p) => p.id === site.projectId)?.name ?? '';
      const group = groups.get(site.projectId) ?? { projectId: site.projectId, projectName, options: [] };
      group.options.push({
        siteId: site.id,
        projectName,
        siteCode: site.siteCode,
        siteName: site.siteName,
        location: site.location,
        investigator: site.investigatorName,
        designation: assignments.find((a) => a.siteId === site.id)?.designation,
        to: paths.siteHub(site.projectId, site.id),
      });
      groups.set(site.projectId, group);
    }
    return [...groups.values()];
  }, [principal, sites, projects, coAffiliations, siteMemberships]);
}
