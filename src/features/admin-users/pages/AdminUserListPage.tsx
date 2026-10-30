import { Outlet } from 'react-router-dom';
import { Drawer } from '@/components/overlay';
import { ROUTES } from '@/app/router/route-paths.constants';
import { UserListView, useRouteDrawer } from '@/features/user-common';
import { useAdminUserList } from '../hooks/useAdminUserList';
import { AdminUserFormContainer } from './AdminUserFormContainer';
import { AdminUserViewContainer } from './AdminUserViewContainer';

/** List + right-hand drawer for create / view / edit (driven by the URL). */
export function AdminUserListPage() {
  const list = useAdminUserList();
  const drawer = useRouteDrawer({
    createPath: ROUTES.adminUserNew,
    viewPattern: ROUTES.adminUserView,
    editPattern: ROUTES.adminUserEdit,
    paramKey: 'userId',
    listPath: ROUTES.adminUsers,
  });

  return (
    <>
      <UserListView {...list} />
      <Drawer isOpen={drawer.isOpen} onClose={drawer.close}>
        {drawer.mode === 'view' && <AdminUserViewContainer key={drawer.contentKey} userId={drawer.id} />}
        {(drawer.mode === 'create' || drawer.mode === 'edit') && (
          <AdminUserFormContainer key={drawer.contentKey} mode={drawer.mode} userId={drawer.id} onDone={drawer.close} />
        )}
      </Drawer>
      {/* Child routes only run their permission guards (403 redirect); they render nothing. */}
      <Outlet />
    </>
  );
}
