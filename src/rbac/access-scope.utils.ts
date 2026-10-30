import type { Id, Principal, Site } from '@/types';

/**
 * Projects the user may enter. Sponsors: affiliated projects. CO/site users:
 * projects of the sites they belong to. Admins work outside projects.
 */
export function getAccessibleProjectIds(principal: Principal | null): Set<Id> {
  const ids = new Set<Id>();
  if (!principal || principal.user.status !== 'active') return ids;
  for (const { scope } of principal.grants) {
    if (scope.type !== 'global') ids.add(scope.projectId);
  }
  return ids;
}

/** Sites the user may enter. Sponsors: every site of an affiliated project. CO/site: their own sites. */
export function getAccessibleSiteIds(principal: Principal | null, sites: Site[]): Set<Id> {
  const ids = new Set<Id>();
  if (!principal || principal.user.status !== 'active') return ids;
  for (const { scope } of principal.grants) {
    if (scope.type === 'site') ids.add(scope.siteId);
    if (scope.type === 'project') {
      sites.filter((s) => s.projectId === scope.projectId).forEach((s) => ids.add(s.id));
    }
  }
  return ids;
}
