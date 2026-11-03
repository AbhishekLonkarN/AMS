import { Outlet, useParams } from 'react-router-dom';
import { Drawer } from '@/components/overlay';
import { ROUTES, paths } from '@/app/router/route-paths.constants';
import { UserListView, useRouteDrawer } from '@/features/user-common';
import { useSiteUserList } from '../hooks/useSiteUserList';
import { SiteUserFormContainer } from './SiteUserFormContainer';
import { SiteUserViewContainer } from './SiteUserViewContainer';

/** List + right-hand drawer for create / view / edit (driven by the URL). */
export function SiteUserListPage() {
  const { projectId = '', siteId = '' } = useParams();
  const list = useSiteUserList();
  const drawer = useRouteDrawer({
    createPath: ROUTES.siteUserNew,
    viewPattern: ROUTES.siteUserView,
    editPattern: ROUTES.siteUserEdit,
    paramKey: 'membershipId',
    listPath: paths.siteUsers(projectId, siteId),
  });

  return (
    <>
      <UserListView {...list} />
      <Drawer isOpen={drawer.isOpen} onClose={drawer.close}>
        {drawer.mode === 'view' && (
          <SiteUserViewContainer key={drawer.contentKey} projectId={projectId} siteId={siteId} membershipId={drawer.id} />
        )}
        {(drawer.mode === 'create' || drawer.mode === 'edit') && (
          <SiteUserFormContainer
            key={drawer.contentKey}
            mode={drawer.mode}
            projectId={projectId}
            siteId={siteId}
            membershipId={drawer.id}
            onDone={drawer.close}
          />
        )}
      </Drawer>
      {/* Child routes only run their permission guards (403 redirect); they render nothing. */}
      <Outlet />
    </>
  );
}
