import { Outlet } from 'react-router-dom';
import { Drawer } from '@/components/overlay';
import { ROUTES } from '@/app/router/route-paths.constants';
import { UserListView, useRouteDrawer } from '@/features/user-common';
import { useTemplateList } from '../hooks/useTemplateList';
import { TemplateFormContainer } from './TemplateFormContainer';
import { TemplateViewContainer } from './TemplateViewContainer';

/** List + right-hand drawer for add / view / edit (driven by the URL). */
export function TemplateListPage() {
  const list = useTemplateList();
  const drawer = useRouteDrawer({
    createPath: ROUTES.accessRightsNew,
    viewPattern: ROUTES.accessRightsView,
    editPattern: ROUTES.accessRightsEdit,
    paramKey: 'templateId',
    listPath: ROUTES.accessRights,
  });

  return (
    <>
      <UserListView {...list} />
      <Drawer isOpen={drawer.isOpen} onClose={drawer.close}>
        {drawer.mode === 'view' && <TemplateViewContainer key={drawer.contentKey} templateId={drawer.id} />}
        {(drawer.mode === 'create' || drawer.mode === 'edit') && (
          <TemplateFormContainer key={drawer.contentKey} mode={drawer.mode} templateId={drawer.id} onDone={drawer.close} />
        )}
      </Drawer>
      {/* Child routes only run their permission guards (403 redirect); they render nothing. */}
      <Outlet />
    </>
  );
}
