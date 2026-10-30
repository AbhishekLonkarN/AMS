import { useMemo } from 'react';
import { useAccessRightsStore, useAffiliationsStore, useProjectsStore, useSitesStore } from '@/store';
import { useCurrentPrincipal, useRouteParams } from '@/rbac';
import { SHELL_LABELS } from '../constants/shell.constants';

/**
 * The current user, the project/site from the URL, and the role label to show
 * (designation in the current project/site, otherwise the account's role).
 */
export function useCurrentContext() {
  const principal = useCurrentPrincipal();
  const { projectId, siteId } = useRouteParams();
  const project = useProjectsStore((s) => s.projects.find((p) => p.id === projectId));
  const site = useSitesStore((s) => s.sites.find((x) => x.id === siteId && x.projectId === projectId));
  const templates = useAccessRightsStore((s) => s.templates);
  const { sponsorAffiliations, coAffiliations, siteMemberships } = useAffiliationsStore();

  const roleLabel = useMemo(() => {
    const user = principal?.user;
    if (!user) return '';
    const isActive = (a: { userId: string; status: string }) => a.userId === user.id && a.status === 'active';

    switch (user.userType) {
      case 'sponsor': {
        const affiliation = sponsorAffiliations.find((a) => isActive(a) && a.projectId === projectId);
        const globalTemplate = templates.find((t) => t.id === user.globalTemplateId);
        return affiliation?.designation ?? globalTemplate?.name ?? SHELL_LABELS.defaultRole.sponsor;
      }
      case 'co':
        return coAffiliations.find((a) => isActive(a) && a.siteId === siteId)?.designation ?? SHELL_LABELS.defaultRole.co;
      case 'site':
        return siteMemberships.find((m) => isActive(m) && m.siteId === siteId)?.designation ?? SHELL_LABELS.defaultRole.site;
      default:
        return SHELL_LABELS.defaultRole.admin;
    }
  }, [principal, projectId, siteId, sponsorAffiliations, coAffiliations, siteMemberships, templates]);

  return { principal, user: principal?.user ?? null, project, site, roleLabel };
}
