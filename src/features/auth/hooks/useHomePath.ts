import { ROUTES, paths } from '@/app/router/route-paths.constants';
import { useAccessibleSites, useCurrentPrincipal } from '@/rbac';

/**
 * Landing page per user type. CO and site users with exactly one site go
 * straight to that site; with several they get the project/site picker.
 */
export function useHomePath(): string {
  const principal = useCurrentPrincipal();
  const sites = useAccessibleSites();

  switch (principal?.user.userType) {
    case 'admin':
      return ROUTES.adminHome;
    case 'sponsor':
      return ROUTES.home;
    case 'co':
    case 'site':
      return sites.length === 1 ? paths.siteHub(sites[0].projectId, sites[0].id) : ROUTES.selectContext;
    default:
      return ROUTES.login;
  }
}
