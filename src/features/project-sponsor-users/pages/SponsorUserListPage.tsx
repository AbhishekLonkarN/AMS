import { Outlet, useParams } from 'react-router-dom';
import { Drawer } from '@/components/overlay';
import { ROUTES, paths } from '@/app/router/route-paths.constants';
import { UserListView, useRouteDrawer } from '@/features/user-common';
import { useSponsorUserList } from '../hooks/useSponsorUserList';
import { SponsorUserFormContainer } from './SponsorUserFormContainer';
import { SponsorUserViewContainer } from './SponsorUserViewContainer';

/** List + right-hand drawer for affiliate / view / edit (driven by the URL). */
export function SponsorUserListPage() {
  const { projectId = '' } = useParams();
  const list = useSponsorUserList();
  const drawer = useRouteDrawer({
    createPath: ROUTES.projectSponsorUserAffiliate,
    viewPattern: ROUTES.projectSponsorUserView,
    editPattern: ROUTES.projectSponsorUserEdit,
    paramKey: 'affiliationId',
    listPath: paths.projectSponsorUsers(projectId),
  });

  return (
    <>
      <UserListView {...list} />
      <Drawer isOpen={drawer.isOpen} onClose={drawer.close}>
        {drawer.mode === 'view' && (
          <SponsorUserViewContainer key={drawer.contentKey} projectId={projectId} affiliationId={drawer.id} />
        )}
        {(drawer.mode === 'create' || drawer.mode === 'edit') && (
          <SponsorUserFormContainer
            key={drawer.contentKey}
            mode={drawer.mode}
            projectId={projectId}
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
