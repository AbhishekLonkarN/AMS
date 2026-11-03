import { Outlet, useNavigate } from 'react-router-dom';
import { Drawer } from '@/components/overlay';
import { ROUTES, paths } from '@/app/router/route-paths.constants';
import { UserListView, useRouteDrawer } from '@/features/user-common';
import { useProjectList } from '../hooks/useProjectList';
import { ProjectFormContainer } from './ProjectFormContainer';

/** List + right-hand drawer for add / edit (driven by the URL). A new project opens its hub. */
export function ProjectListPage() {
  const navigate = useNavigate();
  const list = useProjectList();
  const drawer = useRouteDrawer({
    createPath: ROUTES.projectNew,
    editPattern: ROUTES.projectListEdit,
    paramKey: 'projectId',
    listPath: ROUTES.projects,
  });

  return (
    <>
      <UserListView {...list} />
      <Drawer isOpen={drawer.isOpen} onClose={drawer.close}>
        {(drawer.mode === 'create' || drawer.mode === 'edit') && (
          <ProjectFormContainer
            key={drawer.contentKey}
            mode={drawer.mode}
            projectId={drawer.id}
            onDone={(id) => (drawer.mode === 'create' ? navigate(paths.projectHub(id)) : drawer.close())}
          />
        )}
      </Drawer>
      {/* Child routes only run their permission guards (403 redirect); they render nothing. */}
      <Outlet />
    </>
  );
}
