import { Outlet, useParams } from 'react-router-dom';
import { Drawer } from '@/components/overlay';
import { ROUTES, paths } from '@/app/router/route-paths.constants';
import { UserListView, useRouteDrawer } from '@/features/user-common';
import { useSiteList } from '../hooks/useSiteList';
import { SiteFormContainer } from './SiteFormContainer';

/** List + right-hand drawer for add / edit (driven by the URL). */
export function SiteListPage() {
  const { projectId = '' } = useParams();
  const list = useSiteList();
  const drawer = useRouteDrawer({
    createPath: ROUTES.projectSiteNew,
    editPattern: ROUTES.projectSiteListEdit,
    paramKey: 'siteId',
    listPath: paths.projectSites(projectId),
  });

  return (
    <>
      <UserListView {...list} />
      <Drawer isOpen={drawer.isOpen} onClose={drawer.close}>
        {(drawer.mode === 'create' || drawer.mode === 'edit') && (
          <SiteFormContainer
            key={drawer.contentKey}
            mode={drawer.mode}
            projectId={projectId}
            siteId={drawer.id}
            onDone={drawer.close}
          />
        )}
      </Drawer>
      {/* Child routes only run their permission guards (403 redirect); they render nothing. */}
      <Outlet />
    </>
  );
}
