import { Outlet } from 'react-router-dom';
import { Drawer } from '@/components/overlay';
import { ROUTES, paths } from '@/app/router/route-paths.constants';
import { HubSummaryView, NotFoundPage } from '@/features/shell';
import { useRouteDrawer } from '@/features/user-common';
import { PROJECT_LABELS as L } from '../constants/projects.constants';
import { useProjectHub } from '../hooks/useProjectHub';
import { ProjectFormContainer } from './ProjectFormContainer';

/** Hub summary + "Edit project" drawer over it (driven by the URL). */
export function ProjectHubPage() {
  const model = useProjectHub();
  const drawer = useRouteDrawer({
    editPattern: ROUTES.projectEdit,
    paramKey: 'projectId',
    listPath: paths.projectHub(model?.id ?? ''),
  });
  if (!model) return <NotFoundPage />;

  const { id, ...hub } = model;
  return (
    <>
      <HubSummaryView {...hub} editLabel={L.hubEdit} tilesTitle={L.modulesTitle} />
      <Drawer isOpen={drawer.isOpen} onClose={drawer.close}>
        {drawer.mode === 'edit' && (
          <ProjectFormContainer key={drawer.contentKey} mode="edit" projectId={id} onDone={drawer.close} />
        )}
      </Drawer>
      <Outlet />
    </>
  );
}
