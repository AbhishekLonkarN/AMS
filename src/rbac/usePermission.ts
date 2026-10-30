import type { PermissionKey, Scope } from '@/types';
import { can } from './can.utils';
import { useCurrentPrincipal } from './useCurrentPrincipal';
import { useRouteScope } from './useRouteScope';

/**
 * `scope` omitted → scope from the current route (site/project), or "anywhere"
 * outside a project. Pass `'any'` to force "anywhere".
 */
export type ScopeArg = Scope | 'any' | undefined;

export function usePermission(permission: PermissionKey | PermissionKey[], scope?: ScopeArg): boolean {
  const principal = useCurrentPrincipal();
  const routeScope = useRouteScope();
  const effective = scope === 'any' ? undefined : (scope ?? routeScope);
  return can(principal, permission, effective);
}

/** Returns a checker bound to the current user, for checking many keys at once (lists, nav). */
export function usePermissionChecker() {
  const principal = useCurrentPrincipal();
  const routeScope = useRouteScope();
  return (permission: PermissionKey | PermissionKey[], scope?: ScopeArg) =>
    can(principal, permission, scope === 'any' ? undefined : (scope ?? routeScope));
}
