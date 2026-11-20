import { ROUTES } from '@/app/router/route-paths.constants';
import { useCurrentPrincipal } from '@/rbac';
import type { User } from '@/types';

/** Landing page per user type: admins the admin dashboard, sponsors the Projects list, and CO and Site users the context picker. */
export function useHomePath(): string {
  return homePathForUserType(useCurrentPrincipal()?.user.userType);
}

export function homePathForUserType(userType?: User['userType']): string {
  switch (userType) {
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
