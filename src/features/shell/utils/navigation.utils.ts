import type { NavItemView, TileView } from '@/components/layout';
import type { PermissionKey, Scope, UserType } from '@/types';
import type { NavContext, NavItemConfig, NavSectionConfig } from '../constants/navigation.constants';

type Checker = (permission: PermissionKey | PermissionKey[], scope?: Scope | 'any') => boolean;

export function sectionScope(section: NavSectionConfig, ctx: NavContext): Scope | 'any' | null {
  if (section.context === 'none') return 'any';
  if (section.context === 'project') return ctx.projectId ? { type: 'project', projectId: ctx.projectId } : null;
  return ctx.projectId && ctx.siteId ? { type: 'site', projectId: ctx.projectId, siteId: ctx.siteId } : null;
}

function isItemVisible(item: NavItemConfig, userType: UserType, check: Checker, scope: Scope | 'any') {
  if (item.audiences && !item.audiences.includes(userType)) return false;
  return !item.permission || check(item.permission, scope);
}

/** Visible items of a section (recursively), mapped to sidebar views. */
export function toNavItems(
  items: NavItemConfig[],
  userType: UserType,
  check: Checker,
  scope: Scope | 'any',
  ctx: Required<NavContext>,
): NavItemView[] {
  return items
    .filter((item) => isItemVisible(item, userType, check, scope))
    .map((item) => ({
      key: item.key,
      label: item.label,
      icon: item.icon,
      to: item.to(ctx),
      isEnd: item.isEnd,
      children: item.children ? toNavItems(item.children, userType, check, scope, ctx) : undefined,
    }));
}

export function toTiles(
  items: NavItemConfig[],
  userType: UserType,
  check: Checker,
  scope: Scope | 'any',
  ctx: Required<NavContext>,
): TileView[] {
  return items
    .filter((item) => !item.isHubHidden && isItemVisible(item, userType, check, scope))
    .map((item) => ({
      key: item.key,
      label: item.label,
      description: item.description,
      icon: item.icon,
      to: item.to(ctx),
    }));
}
