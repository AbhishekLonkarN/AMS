import { useMemo } from 'react';
import type { NavSectionView } from '@/components/layout';
import { usePermissionChecker } from '@/rbac';
import { NAV_SECTIONS } from '../constants/navigation.constants';
import { SECTION_TITLES } from '../constants/shell.constants';
import { sectionScope, toNavItems } from '../utils/navigation.utils';
import { useCurrentContext } from './useCurrentContext';

/** Sidebar sections for the current user and route, permission-filtered. */
export function useShellNavigation(): NavSectionView[] {
  const { user, project, site } = useCurrentContext();
  const check = usePermissionChecker();

  return useMemo(() => {
    if (!user) return [];
    const ctx = { projectId: project?.id ?? '', siteId: site?.id ?? '' };

    return NAV_SECTIONS.filter((section) => section.audiences.includes(user.userType)).flatMap((section) => {
      const scope = sectionScope(section, { projectId: project?.id, siteId: site?.id });
      if (!scope) return [];
      const items = toNavItems(section.items, user.userType, check, scope, ctx);
      if (!items.length) return [];

      const subtitle =
        section.key === 'project' ? project?.name : section.key === 'site' ? `${site?.siteCode} · ${site?.siteName}` : undefined;
      return [{ key: section.key, title: SECTION_TITLES[section.key], subtitle, items }];
    });
  }, [user, project, site, check]);
}
