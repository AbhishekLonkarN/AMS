import { Outlet } from 'react-router-dom';
import { Drawer } from '@/components/overlay';
import { ROUTES, paths } from '@/app/router/route-paths.constants';
import { HubSummaryView, NotFoundPage } from '@/features/shell';
import { useRouteDrawer } from '@/features/user-common';
import { SITE_LABELS as L } from '../constants/sites.constants';
import { useSiteHub } from '../hooks/useSiteHub';
import { SiteFormContainer } from './SiteFormContainer';

/** Hub summary + "Edit site" drawer over it (driven by the URL). */
export function SiteHubPage() {
  const model = useSiteHub();
  const drawer = useRouteDrawer({
    editPattern: ROUTES.siteEdit,
    paramKey: 'siteId',
    listPath: model ? paths.siteHub(model.projectId, model.id) : '',
  });
  if (!model) return <NotFoundPage />;

  const { id, projectId, ...hub } = model;
  return (
    <>
      <HubSummaryView {...hub} editLabel={L.hubEdit} tilesTitle={L.modulesTitle} />
      <Drawer isOpen={drawer.isOpen} onClose={drawer.close}>
        {drawer.mode === 'edit' && (
          <SiteFormContainer key={drawer.contentKey} mode="edit" projectId={projectId} siteId={id} onDone={drawer.close} />
        )}
      </Drawer>
      <Outlet />
    </>
  );
}
