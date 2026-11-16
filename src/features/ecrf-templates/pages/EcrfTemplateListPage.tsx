import { Outlet } from 'react-router-dom';
import { Drawer } from '@/components/overlay';
import { ROUTES } from '@/app/router/route-paths.constants';
import { NotFoundPage } from '@/features/shell';
import { UserListView, useRouteDrawer } from '@/features/user-common';
import { EcrfTemplateFormView } from '../components/EcrfTemplateFormView';
import { useEcrfTemplateForm, type EcrfFormMode } from '../hooks/useEcrfTemplateForm';
import { useEcrfTemplateList } from '../hooks/useEcrfTemplateList';

/** List + a wide drawer holding the Details tab and the form builder (driven by the URL). */
export function EcrfTemplateListPage() {
  const list = useEcrfTemplateList();
  const drawer = useRouteDrawer({
    createPath: ROUTES.ecrfTemplateNew,
    editPattern: ROUTES.ecrfTemplateEdit,
    paramKey: 'templateId',
    listPath: ROUTES.ecrfTemplates,
  });
  const isFormMode = drawer.mode === 'create' || drawer.mode === 'edit';

  return (
    <>
      <UserListView {...list} />
      <Drawer isOpen={drawer.isOpen} onClose={drawer.close} size="xl">
        {isFormMode && (
          <EcrfTemplateFormContainer
            key={drawer.contentKey}
            mode={drawer.mode as EcrfFormMode}
            templateId={drawer.id}
            onDone={drawer.close}
          />
        )}
      </Drawer>
      {/* Child routes only run their permission guards (403 redirect); they render nothing. */}
      <Outlet />
    </>
  );
}

interface EcrfTemplateFormContainerProps {
  mode: EcrfFormMode;
  templateId?: string;
  onDone: () => void;
}

function EcrfTemplateFormContainer({ mode, templateId, onDone }: EcrfTemplateFormContainerProps) {
  const { isNotFound, ...model } = useEcrfTemplateForm({ mode, templateId, onDone });
  if (isNotFound) {
    return <NotFoundPage />;
  }
  return <EcrfTemplateFormView {...model} />;
}
