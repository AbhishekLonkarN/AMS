import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useSitesStore } from '@/store';
import { useAccessibleSites } from '@/rbac';
import { NotFoundPage } from '@/features/shell';
import { ROUTES } from '../route-paths.constants';

/** The site must belong to the project in the URL and be accessible to the user. */
export function RequireSiteAccess() {
  const { projectId, siteId } = useParams();
  const isKnown = useSitesStore((s) => s.sites.some((x) => x.id === siteId && x.projectId === projectId));
  const isAccessible = useAccessibleSites(projectId).some((s) => s.id === siteId);

  if (!isKnown) return <NotFoundPage />;
  if (!isAccessible) return <Navigate to={ROUTES.forbidden} replace />;
  return <Outlet />;
}
