import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCurrentPrincipal } from '@/rbac';
import { ROUTES } from '../route-paths.constants';

/** Any signed-in, active user. Inactive users are bounced to login (assumption: immediate effect). */
export function RequireAuth() {
  const principal = useCurrentPrincipal();
  const location = useLocation();

  if (!principal || principal.user.status !== 'active') {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
