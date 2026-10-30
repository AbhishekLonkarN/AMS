import type { ReactNode } from 'react';
import type { PermissionKey } from '@/types';
import { usePermission, type ScopeArg } from './usePermission';

interface CanProps {
  permission: PermissionKey | PermissionKey[];
  scope?: ScopeArg;
  fallback?: ReactNode;
  children: ReactNode;
}

/** Renders children only when the current user has the permission (any of, for arrays). */
export function Can({ permission, scope, fallback = null, children }: CanProps) {
  const isAllowed = usePermission(permission, scope);
  return <>{isAllowed ? children : fallback}</>;
}
