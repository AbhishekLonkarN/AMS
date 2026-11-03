import { Outlet, useParams } from 'react-router-dom';
import { Drawer } from '@/components/overlay';
import { ROUTES, paths } from '@/app/router/route-paths.constants';
import { UserListView, useRouteDrawer } from '@/features/user-common';
import { useCoUserList } from '../hooks/useCoUserList';
import { CoUserFormContainer } from './CoUserFormContainer';
import { CoUserViewContainer } from './CoUserViewContainer';

/** List + right-hand drawer for affiliate / view / edit (driven by the URL). */
export function CoUserListPage() {
  const { projectId = '', siteId = '' } = useParams();
  const list = useCoUserList();
  const drawer = useRouteDrawer({
    createPath: ROUTES.siteCoUserAffiliate,
    viewPattern: ROUTES.siteCoUserView,
    editPattern: ROUTES.siteCoUserEdit,
    paramKey: 'affiliationId',
    listPath: paths.siteCoUsers(projectId, siteId),
  });

  return (
    <>
      <UserListView {...list} />
      <Drawer isOpen={drawer.isOpen} onClose={drawer.close}>
        {drawer.mode === 'view' && (
          <CoUserViewContainer key={drawer.contentKey} projectId={projectId} siteId={siteId} affiliationId={drawer.id} />
        )}
        {(drawer.mode === 'create' || drawer.mode === 'edit') && (
          <CoUserFormContainer
            key={drawer.contentKey}
            mode={drawer.mode}
            projectId={projectId}
            siteId={siteId}
            affiliationId={drawer.id}
            onDone={drawer.close}
          />
        )}
      </Drawer>
      {/* Child routes only run their permission guards (403 redirect); they render nothing. */}
      <Outlet />
    </>
  );
}
