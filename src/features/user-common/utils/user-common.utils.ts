import type { AccessRightsTemplate, PermissionKey, ScopeType, User, UserType } from '@/types';
import { isSamePermissionSet, sanitizePermissions } from '@/rbac';
import { formatDate } from '@/utils/date.utils';
import { fullName } from '@/utils/string.utils';

export const displayName = (user?: Pick<User, 'prefix' | 'name'>) => (user ? fullName(user.prefix, user.name) : '');

export const userNameById = (users: User[], id?: string) => displayName(users.find((u) => u.id === id));

export const formatCreated = (iso?: string) => formatDate(iso);

/** Template slice for a user type/scope, or undefined when no template. */
export function templateSlice(
  templates: AccessRightsTemplate[],
  templateId: string | undefined,
  userType: UserType,
  scopeType?: ScopeType,
): PermissionKey[] | undefined {
  const template = templates.find((t) => t.id === templateId);
  return template ? sanitizePermissions(userType, template.permissions, scopeType) : undefined;
}

export function isCustomisedFrom(
  templates: AccessRightsTemplate[],
  templateId: string | undefined,
  permissions: PermissionKey[],
  userType: UserType,
  scopeType?: ScopeType,
) {
  const slice = templateSlice(templates, templateId, userType, scopeType);
  return !!slice && !isSamePermissionSet(slice, permissions);
}
