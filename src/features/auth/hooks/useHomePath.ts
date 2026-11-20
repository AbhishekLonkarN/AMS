import { ROUTES } from '@/app/router/route-paths.constants';
import { useCurrentPrincipal } from '@/rbac';

/** Landing page per user type: admins the admin dashboard, sponsors the Projects list, and CO and Site users the context picker. */
export function useHomePath(): string {
  const principal = useCurrentPrincipal();

  switch (principal?.user.userType) {
    case 'admin':
      return ROUTES.adminHome;
    case 'sponsor':
      return ROUTES.projects;
    case 'co':
    case 'site':
      return ROUTES.selectContext;
    default:
      return ROUTES.login;
  }
}
