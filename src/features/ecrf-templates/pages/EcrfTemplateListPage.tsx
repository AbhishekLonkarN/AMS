import { Outlet } from 'react-router-dom';
import { Drawer, DrawerPanel } from '@/components/overlay';
import { EmptyState } from '@/components/feedback';
import { ROUTES } from '@/app/router/route-paths.constants';
import { NotFoundPage } from '@/features/shell';
import { UserListView, useRouteDrawer } from '@/features/user-common';
import { EcrfTemplateFormView } from '../components/EcrfTemplateFormView';
import { ECRF_TEMPLATE_LABELS as L } from '../constants/ecrf-templates.constants';
import { useEcrfTemplateEditor, type EcrfFormMode } from '../hooks/useEcrfTemplateEditor';
import { useEcrfTemplateForm } from '../hooks/useEcrfTemplateForm';
import { useEcrfTemplateList } from '../hooks/useEcrfTemplateList';
import type { EcrfDesign, EcrfTemplate } from '@/types';

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
          <EcrfTemplateEditorContainer
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

interface EcrfTemplateEditorContainerProps {
  mode: EcrfFormMode;
  templateId?: string;
  onDone: () => void;
}

/** Loads the template and its design (Edit), then hands them to the form. */
function EcrfTemplateEditorContainer({ mode, templateId, onDone }: EcrfTemplateEditorContainerProps) {
  const { state, retry } = useEcrfTemplateEditor(mode, templateId);
  const title = mode === 'create' ? L.createTitle : L.editTitle;

  if (state.status === 'notFound') {
    return <NotFoundPage />;
  }
  if (state.status === 'loading') {
    return (
      <DrawerPanel title={title}>
        <EmptyState title={L.loadingTemplate} />
      </DrawerPanel>
    );
  }
  if (state.status === 'failed') {
    return (
      <DrawerPanel title={title}>
        <EmptyState
          title={L.loadTemplateFailed}
          description={state.message}
          action={
            <button type="button" className="btn btn-secondary btn-sm" onClick={retry}>
              {L.retry}
            </button>
          }
        />
      </DrawerPanel>
    );
  }
  return <EcrfTemplateFormContainer mode={mode} template={state.template} design={state.design} onDone={onDone} />;
}

interface EcrfTemplateFormContainerProps {
  mode: EcrfFormMode;
  template?: EcrfTemplate;
  design?: EcrfDesign;
  onDone: () => void;
}

function EcrfTemplateFormContainer(props: EcrfTemplateFormContainerProps) {
  const model = useEcrfTemplateForm(props);
  return <EcrfTemplateFormView {...model} />;
}
