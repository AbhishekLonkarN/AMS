import type { ActionKey, MatrixDefinition, ModuleDefinition, PermissionKey, ScopeType } from '@/types';
import { toPermissionKey } from '@/rbac/permission.utils';

export function getVisibleModules(matrix: MatrixDefinition, scopeTypes?: ScopeType[]): ModuleDefinition[] {
  return matrix.modules.filter((m) => !scopeTypes || scopeTypes.includes(m.scope));
}

/** Action columns that have at least one applicable cell among the visible modules. */
export function getVisibleActions(matrix: MatrixDefinition, modules: ModuleDefinition[]): ActionKey[] {
  return matrix.actions.filter((a) => modules.some((m) => m.actions.includes(a)));
}

export const rowKeys = (module: ModuleDefinition): PermissionKey[] =>
  module.actions.map((a) => toPermissionKey(module.key, a));

export const columnKeys = (modules: ModuleDefinition[], action: ActionKey): PermissionKey[] =>
  modules.filter((m) => m.actions.includes(action)).map((m) => toPermissionKey(m.key, action));

export const allKeys = (modules: ModuleDefinition[]): PermissionKey[] => modules.flatMap(rowKeys);

export type CheckState = 'all' | 'some' | 'none';

export function getCheckState(keys: PermissionKey[], selected: Set<PermissionKey>): CheckState {
  const count = keys.filter((k) => selected.has(k)).length;
  if (count === 0) return 'none';
  return count === keys.length ? 'all' : 'some';
}

/** Adds or removes `keys`, leaving every other key in `value` untouched. */
export function setKeys(value: PermissionKey[], keys: PermissionKey[], isChecked: boolean): PermissionKey[] {
  const next = new Set(value);
  keys.forEach((k) => (isChecked ? next.add(k) : next.delete(k)));
  return [...next];
}
