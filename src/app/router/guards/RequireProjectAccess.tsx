import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useProjectsStore } from '@/store';
import { useAccessibleProjects } from '@/rbac';
import { NotFoundPage } from '@/features/shell';
import { ROUTES } from '../route-paths.constants';

/** The project must exist and be one the user is affiliated to (directly or via a site). */
export function RequireProjectAccess() {
  const { projectId } = useParams();
  const isKnown = useProjectsStore((s) => s.projects.some((p) => p.id === projectId));
  const isAccessible = useAccessibleProjects().some((p) => p.id === projectId);

  if (!isKnown) return <NotFoundPage />;
  if (!isAccessible) return <Navigate to={ROUTES.forbidden} replace />;
  return <Outlet />;
}
