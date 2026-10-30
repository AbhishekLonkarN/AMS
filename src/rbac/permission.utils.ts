import type { ActionKey, ModuleDefinition, ModuleKey, PermissionKey, ScopeType, UserType } from '@/types';
import { ACTION_LABELS, MODULE_LABELS, PERMISSION_CATALOG } from './permission-catalog.constants';

export const toPermissionKey = (module: ModuleKey, action: ActionKey): PermissionKey =>
  `${module}.${action}` as PermissionKey;

export function parsePermissionKey(key: PermissionKey): { module: ModuleKey; action: ActionKey } {
  const [module, action] = key.split('.') as [ModuleKey, ActionKey];
  return { module, action };
}

export const getMatrix = (userType: UserType) => PERMISSION_CATALOG[userType];

export const getModuleLabel = (module: ModuleDefinition) => module.label ?? MODULE_LABELS[module.key];

/** Every applicable permission for a user type, optionally limited to one scope type. */
export function getAllPermissions(userType: UserType, scopeType?: ScopeType): PermissionKey[] {
  return getMatrix(userType)
    .modules.filter((m) => !scopeType || m.scope === scopeType)
    .flatMap((m) => m.actions.map((a) => toPermissionKey(m.key, a)));
}

/** Drops keys that are not applicable for the user type (and scope type, if given). */
export function sanitizePermissions(
  userType: UserType,
  keys: readonly PermissionKey[],
  scopeType?: ScopeType,
): PermissionKey[] {
  const allowed = new Set(getAllPermissions(userType, scopeType));
  return [...new Set(keys)].filter((k) => allowed.has(k));
}

export function isSamePermissionSet(a: readonly PermissionKey[], b: readonly PermissionKey[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  return b.every((k) => setA.has(k));
}

export function formatPermission(key: PermissionKey): string {
  const { module, action } = parsePermissionKey(key);
  return `${MODULE_LABELS[module] ?? module}: ${ACTION_LABELS[action] ?? action}`;
}

export function diffPermissions(before: readonly PermissionKey[], after: readonly PermissionKey[]) {
  const beforeSet = new Set(before);
  const afterSet = new Set(after);
  return {
    added: after.filter((k) => !beforeSet.has(k)),
    removed: before.filter((k) => !afterSet.has(k)),
  };
}
