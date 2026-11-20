import { useMatches, useNavigate } from 'react-router-dom';
import type { ContextChipView } from '@/components/layout';
import { useCompanyProfileStore, useSessionStore } from '@/store';
import { ROUTES, paths } from '@/app/router/route-paths.constants';
import { useDemoUsers } from '@/features/auth';
import { homePathForUserType } from '@/features/auth/hooks/useHomePath';
import clintechLogo from '@/assets/clintech-logo.png';
import { fullName, initials } from '@/utils/string.utils';
import { PLATFORM_BRAND_NAME } from '../constants/shell.constants';
import { useCurrentContext } from './useCurrentContext';
import { useShellNavigation } from './useShellNavigation';

/** Everything the app shell renders: brand, sidebar sections, context chips, user menu. */
export function useShellLayout() {
  const navigate = useNavigate();
  const profile = useCompanyProfileStore((s) => s.profile);
  const switchUser = useSessionStore((s) => s.switchUser);
  const logout = useSessionStore((s) => s.logout);
  const { user, project, site, roleLabel } = useCurrentContext();
  const sections = useShellNavigation();
  const demoUsers = useDemoUsers();
  const matches = useMatches();

  // The page = deepest matched route that isn't an overlay (drawer URLs keep the list's key).
  const pageMatch = [...matches].reverse().find((m) => !(m.handle as { isOverlay?: boolean } | undefined)?.isOverlay);
  const pageKey = pageMatch?.pathname ?? '';

  const isSponsor = user?.userType === 'sponsor';

  const projectChip: ContextChipView | undefined = project && {
    label: project.name,
    detail: `${project.testProduct} · ${project.sponsor}`,
    to: isSponsor ? paths.projectHub(project.id) : undefined,
  };

  const siteChip: ContextChipView | undefined = site && {
    label: site.siteCode,
    detail: `${site.investigatorName} · ${site.siteName}, ${site.location}`,
    to: paths.siteHub(site.projectId, site.id),
  };

  const handleSwitchUser = (userId: string) => {
    const result = switchUser(userId);
    if (result.isSuccess) {navigate(homePathForUserType(result.user.userType), { replace: true, flushSync: true });}
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.login, { replace: true });
  };

  return {
    // All four user types (Admin, Sponsor, CO, Site) share the same AMS palette and the ClinTech logo.
    variant: 'admin' as const,
    brand: { name: PLATFORM_BRAND_NAME, subtitle: profile.ownerDisplayName, logo: clintechLogo },
    sections,
    pageKey,
    projectChip,
    siteChip,
    userMenu: user && {
      name: fullName(user.prefix, user.name),
      email: user.email,
      roleLabel,
      initials: initials(user.name),
      currentUserId: user.id,
      demoUsers,
      assumptionsTo: ROUTES.assumptions,
      uiKitTo: ROUTES.uiKit,
    },
    handleSwitchUser,
    handleLogout,
  };
}
