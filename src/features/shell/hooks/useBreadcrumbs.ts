import { useLocation } from 'react-router-dom';
import type { BreadcrumbView } from '@/components/layout';
import { ROUTES, paths } from '@/app/router/route-paths.constants';
import { PAGE_TITLES } from '@/constants/page-titles.constants';
import { NAV_SECTIONS, type NavItemConfig } from '../constants/navigation.constants';
import { useCurrentContext } from './useCurrentContext';

const isInside = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`);

/** The nav item whose page the URL is on (the longest matching path wins). */
function currentItem(items: NavItemConfig[], pathname: string, ctx: { projectId: string; siteId: string }) {
  return items
    .filter((item) => !item.isHubHidden)
    .map((item) => ({ item, to: item.to(ctx) }))
    .filter(({ to }) => isInside(pathname, to))
    .sort((a, b) => b.to.length - a.to.length)[0];
}

/**
 * Trail inside a project or site, which replaces the project / site sidebar menu:
 *   Sponsor:  Projects › Project › Page            Projects › Project › Sites › Site › Page
 *   CO / site: My Projects & Sites › Site › Page
 * Pages outside a project or site get no trail.
 */
export function useBreadcrumbs(): BreadcrumbView[] {
  const { pathname } = useLocation();
  const { user, project, site } = useCurrentContext();
  if (!user || !project) {return [];}

  const ctx = { projectId: project.id, siteId: site?.id ?? '' };

  // CO / CRO and site users only ever work inside a site: My Projects & Sites › Site › Page.
  if (user.userType !== 'sponsor') {
    if (!site) {return [];}
    const sitePath = paths.siteHub(project.id, site.id);
    const siteItems = NAV_SECTIONS.find((s) => s.key === 'site')?.items ?? [];
    const page = currentItem(siteItems, pathname, ctx);
    const trail: BreadcrumbView[] = [
      { label: PAGE_TITLES.selectContext, to: ROUTES.selectContext },
      { label: site.siteCode, to: sitePath },
    ];
    if (page) {trail.push({ label: page.item.label });}
    return trail;
  }

  const hubPath = paths.projectHub(project.id);
  const trail: BreadcrumbView[] = [
    { label: PAGE_TITLES.projects, to: ROUTES.projects },
    { label: project.name, to: hubPath },
  ];

  const sitePath = site ? paths.siteHub(project.id, site.id) : undefined;
  if (site && sitePath && isInside(pathname, sitePath)) {
    const siteItems = NAV_SECTIONS.find((s) => s.key === 'site')?.items ?? [];
    const page = currentItem(siteItems, pathname, ctx);
    trail.push({ label: PAGE_TITLES.sites, to: paths.projectSites(project.id) }, { label: site.siteCode, to: sitePath });
    if (page) {trail.push({ label: page.item.label });}
    return trail;
  }

  const projectItems = NAV_SECTIONS.find((s) => s.key === 'project')?.items ?? [];
  const page = currentItem(projectItems, pathname, ctx);
  if (page) {trail.push({ label: page.item.label });}
  return trail;
}
