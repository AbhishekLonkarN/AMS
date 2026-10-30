import { useMemo } from 'react';
import type { TileView } from '@/components/layout';
import { usePermissionChecker } from '@/rbac';
import { NAV_SECTIONS, type NavSectionKey } from '../constants/navigation.constants';
import { sectionScope, toTiles } from '../utils/navigation.utils';
import { useCurrentContext } from './useCurrentContext';

export type HubKey = Extract<NavSectionKey, 'admin' | 'sponsor' | 'project' | 'site'> | 'masters';

/** Hub overview tiles: the same items as the sidebar section, permission-filtered. */
export function useHubTiles(hub: HubKey): TileView[] {
  const { user, project, site } = useCurrentContext();
  const check = usePermissionChecker();

  return useMemo(() => {
    if (!user) return [];
    const sectionKey = hub === 'masters' ? 'sponsor' : hub;
    const section = NAV_SECTIONS.find((s) => s.key === sectionKey);
    if (!section) return [];

    const scope = sectionScope(section, { projectId: project?.id, siteId: site?.id });
    if (!scope) return [];
    const items = hub === 'masters' ? (section.items.find((i) => i.key === 'masters')?.children ?? []) : section.items;
    return toTiles(items, user.userType, check, scope, { projectId: project?.id ?? '', siteId: site?.id ?? '' });
  }, [hub, user, project, site, check]);
}
