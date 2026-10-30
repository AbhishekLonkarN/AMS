import type { ACTION_KEYS, MODULE_LABELS } from '@/rbac/permission-catalog.constants';
import type { Id } from './common.types';

export type UserType = 'admin' | 'sponsor' | 'co' | 'site';

export type ActionKey = (typeof ACTION_KEYS)[number];

export type ModuleKey = keyof typeof MODULE_LABELS;

/** `module.action`, e.g. `siteUserManagement.new`. */
export type PermissionKey = `${ModuleKey}.${ActionKey}`;

export type ScopeType = 'global' | 'project' | 'site';

export type Scope =
  | { type: 'global' }
  | { type: 'project'; projectId: Id }
  | { type: 'site'; projectId: Id; siteId: Id };

export interface Grant {
  scope: Scope;
  permissions: PermissionKey[];
}

export interface ModuleDefinition {
  key: ModuleKey;
  /** Overrides the shared module label for this matrix (e.g. site "Project Contacts for Support"). */
  label?: string;
  actions: ActionKey[];
  scope: ScopeType;
}

export interface MatrixDefinition {
  userType: UserType;
  actions: ActionKey[];
  modules: ModuleDefinition[];
}

/** A user plus their effective grants; the input to `can()`. */
export interface Principal {
  user: import('./user.types').User;
  grants: Grant[];
}
