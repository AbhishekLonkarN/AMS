import { Outlet, useLocation } from 'react-router-dom';
import { Drawer } from '@/components/overlay';
import { ROUTES } from '@/app/router/route-paths.constants';
import { UserListView, useRouteDrawer } from '@/features/user-common';
import { AccountFormContainer, AccountViewContainer } from '@/features/sponsor-co-accounts';
import { useUsersList } from '../hooks/useUsersList';
import { AdminUserFormContainer } from './AdminUserFormContainer';
import { AdminUserViewContainer } from './AdminUserViewContainer';

/**
 * The Users tab: one list of Admin, Sponsor and CO users. Create / view / edit open in a right-hand
 * drawer driven by the URL; admin and sponsor/CO users each keep their own form and detail view.
 */
export function UsersListPage() {
  const list = useUsersList();
  const { search } = useLocation();

  const adminDrawer = useRouteDrawer({
    createPath: ROUTES.adminUserNew,
    viewPattern: ROUTES.adminUserView,
    editPattern: ROUTES.adminUserEdit,
    paramKey: 'userId',
    listPath: ROUTES.users,
  });
  const accountDrawer = useRouteDrawer({
    createPath: ROUTES.accountNew,
    viewPattern: ROUTES.accountView,
    editPattern: ROUTES.accountEdit,
    paramKey: 'userId',
    listPath: ROUTES.users,
  });

  return (
    <>
      <UserListView {...list} />

      <Drawer isOpen={adminDrawer.isOpen} onClose={adminDrawer.close}>
        {adminDrawer.mode === 'view' && <AdminUserViewContainer key={adminDrawer.contentKey} userId={adminDrawer.id} />}
        {(adminDrawer.mode === 'create' || adminDrawer.mode === 'edit') && (
          <AdminUserFormContainer
            key={adminDrawer.contentKey}
            mode={adminDrawer.mode}
            userId={adminDrawer.id}
            onDone={adminDrawer.close}
          />
        )}
      </Drawer>

      <Drawer isOpen={accountDrawer.isOpen} onClose={accountDrawer.close}>
        {accountDrawer.mode === 'view' && (
          <AccountViewContainer key={accountDrawer.contentKey} userId={accountDrawer.id} />
        )}
        {(accountDrawer.mode === 'create' || accountDrawer.mode === 'edit') && (
          <AccountFormContainer
            // `?type=` picks Sponsor or CO in the create form, so it is part of the key.
            key={`${accountDrawer.contentKey}${search}`}
            mode={accountDrawer.mode}
            userId={accountDrawer.id}
            onDone={accountDrawer.close}
          />
        )}
      </Drawer>

      {/* Child routes only run their permission guards (403 redirect); they render nothing. */}
      <Outlet />
    </>
  );
}
