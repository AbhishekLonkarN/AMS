import { Outlet } from 'react-router-dom';
import { Drawer } from '@/components/overlay';
import { ROUTES } from '@/app/router/route-paths.constants';
import { UserListView, useRouteDrawer } from '@/features/user-common';
import { useAccountList } from '../hooks/useAccountList';
import { AccountFormContainer } from './AccountFormContainer';
import { AccountViewContainer } from './AccountViewContainer';

/** List + right-hand drawer for create / view / edit (driven by the URL). */
export function AccountListPage() {
  const list = useAccountList();
  const drawer = useRouteDrawer({
    createPath: ROUTES.accountNew,
    viewPattern: ROUTES.accountView,
    editPattern: ROUTES.accountEdit,
    paramKey: 'userId',
    listPath: ROUTES.accounts,
  });

  return (
    <>
      <UserListView {...list} />
      <Drawer isOpen={drawer.isOpen} onClose={drawer.close}>
        {drawer.mode === 'view' && <AccountViewContainer key={drawer.contentKey} userId={drawer.id} />}
        {(drawer.mode === 'create' || drawer.mode === 'edit') && (
          <AccountFormContainer key={drawer.contentKey} mode={drawer.mode} userId={drawer.id} onDone={drawer.close} />
        )}
      </Drawer>
      {/* Child routes only run their permission guards (403 redirect); they render nothing. */}
      <Outlet />
    </>
  );
}
