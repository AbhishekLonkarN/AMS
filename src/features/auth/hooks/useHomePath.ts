import { ROUTES } from '@/app/router/route-paths.constants';
import { useCurrentPrincipal } from '@/rbac';

/** Landing page per user type: admins the admin dashboard, everyone else their own dashboard. */
export function useHomePath(): string {
  const principal = useCurrentPrincipal();

  switch (principal?.user.userType) {
    case 'admin':
      return ROUTES.adminHome;
    case 'sponsor':
    case 'co':
    case 'site':
      return ROUTES.personalDashboard;
    default:
      return ROUTES.login;
  }
}
