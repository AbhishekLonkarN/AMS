import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import type { PermissionKey } from '@/types';
import { ROUTES } from '@/app/router/route-paths.constants';
import { usePermission, type ScopeArg } from './usePermission';

interface RequirePermissionProps {
  permission: PermissionKey | PermissionKey[];
  scope?: ScopeArg;
  children?: ReactNode;
}

/** Route guard: renders children (or the nested route) or redirects to the 403 page. */
export function RequirePermission({ permission, scope, children }: RequirePermissionProps) {
  const isAllowed = usePermission(permission, scope);
  if (!isAllowed) return <Navigate to={ROUTES.forbidden} replace />;
  return <>{children ?? <Outlet />}</>;
}
