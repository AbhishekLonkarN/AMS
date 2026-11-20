import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import type { Preset } from '@/types';
import { Drawer, DrawerPanel } from '@/components/overlay';
import { EmptyState } from '@/components/feedback';
import { PRESET_COPY_PARAM, ROUTES, paths } from '@/app/router/route-paths.constants';
import { NotFoundPage } from '@/features/shell';
import { UserListView, useRouteDrawer } from '@/features/user-common';
import { PresetDetailView } from '../components/PresetDetailView';
import { PresetFormView } from '../components/PresetFormView';
import { PRESET_LABELS as L } from '../constants/preset-library.constants';
import { usePresetForm, type PresetFormMode } from '../hooks/usePresetForm';
import { usePresetList, usePresetRights } from '../hooks/usePresetList';
import { usePresetRecord } from '../hooks/usePresetRecord';

/** The library list + one drawer for View / Add / Edit / Duplicate, driven by the URL. */
export function PresetLibraryPage() {
  const { list, requestDelete } = usePresetList();
  const drawer = useRouteDrawer({
    createPath: ROUTES.presetNew,
    viewPattern: ROUTES.presetView,
    editPattern: ROUTES.presetEdit,
    paramKey: 'presetId',
    listPath: ROUTES.presetLibrary,
  });
  const [searchParams] = useSearchParams();
  const copyOf = drawer.mode === 'create' ? (searchParams.get(PRESET_COPY_PARAM) ?? undefined) : undefined;

  return (
    <>
      <UserListView {...list} />
      <Drawer isOpen={drawer.isOpen} onClose={drawer.close} size="xl">
        {drawer.mode === 'view' && (
          <PresetViewContainer key={drawer.contentKey} presetId={drawer.id} onDelete={requestDelete} />
        )}
        {drawer.mode === 'edit' && <PresetFormContainer key={drawer.contentKey} mode="edit" presetId={drawer.id} />}
        {drawer.mode === 'create' && (
          <PresetFormContainer key={`${drawer.contentKey}:${copyOf ?? ''}`} mode={copyOf ? 'duplicate' : 'create'} presetId={copyOf} />
        )}
      </Drawer>
      {/* Child routes only run their permission guards (403 redirect); they render nothing. */}
      <Outlet />
    </>
  );
}

/** Loading / not found / failed states shared by the drawer contents. */
function LoadGate({
  presetId,
  title,
  children,
}: {
  presetId?: string;
  title: string;
  children: (preset?: Preset) => JSX.Element;
}) {
  const { state, retry } = usePresetRecord(presetId);
  if (state.status === 'notFound') {
    return <NotFoundPage />;
  }
  if (state.status === 'loading') {
    return (
      <DrawerPanel title={title}>
        <EmptyState title={L.loadingPreset} />
      </DrawerPanel>
    );
  }
  if (state.status === 'failed') {
    return (
      <DrawerPanel title={title}>
        <EmptyState
          title={L.loadPresetFailed}
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
  return children(state.status === 'ready' ? state.preset : undefined);
}

function PresetViewContainer({ presetId, onDelete }: { presetId?: string; onDelete: (preset: Preset) => void }) {
  const navigate = useNavigate();
  const { canCreate, canEdit, canDelete } = usePresetRights();
  return (
    <LoadGate presetId={presetId} title={L.listTitle}>
      {(preset) =>
        preset ? (
          <PresetDetailView
            preset={preset}
            onEdit={canEdit ? () => navigate(paths.presetEdit(preset.id)) : undefined}
            onDuplicate={canCreate ? () => navigate(paths.presetDuplicate(preset.id)) : undefined}
            onDelete={canDelete ? () => onDelete(preset) : undefined}
          />
        ) : (
          <NotFoundPage />
        )
      }
    </LoadGate>
  );
}

const FORM_TITLES = { create: L.createTitle, edit: L.editTitle, duplicate: L.duplicateTitle } as const;

function PresetFormContainer({ mode, presetId }: { mode: PresetFormMode; presetId?: string }) {
  return (
    <LoadGate presetId={presetId} title={FORM_TITLES[mode]}>
      {(source) => <PresetForm mode={mode} source={source} />}
    </LoadGate>
  );
}

function PresetForm({ mode, source }: { mode: PresetFormMode; source?: Preset }) {
  const navigate = useNavigate();
  // After saving, the drawer shows the saved pre-set; Back then returns to the list.
  const model = usePresetForm({
    mode,
    source,
    onSaved: (saved) => navigate(paths.presetView(saved.id), { replace: true }),
  });
  return <PresetFormView model={model} currentTitle={source?.title} />;
}
