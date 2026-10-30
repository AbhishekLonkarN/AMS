import { HubSummaryView, NotFoundPage } from '@/features/shell';
import { SITE_LABELS as L } from '../constants/sites.constants';
import { useSiteHub } from '../hooks/useSiteHub';

export function SiteHubPage() {
  const model = useSiteHub();
  if (!model) return <NotFoundPage />;
  return <HubSummaryView {...model} editLabel={L.hubEdit} tilesTitle={L.modulesTitle} />;
}
