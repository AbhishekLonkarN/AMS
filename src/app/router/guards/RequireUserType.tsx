import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import type { UserType } from '@/types';
import { useCurrentPrincipal } from '@/rbac';
import { ROUTES } from '../route-paths.constants';

interface RequireUserTypeProps {
  types: UserType[];
  children?: ReactNode;
}

/** For portal pages with no single permission (homes, hubs, dashboards). */
export function RequireUserType({ types, children }: RequireUserTypeProps) {
  const principal = useCurrentPrincipal();
  if (!principal || !types.includes(principal.user.userType)) return <Navigate to={ROUTES.forbidden} replace />;
  return <>{children ?? <Outlet />}</>;
}
