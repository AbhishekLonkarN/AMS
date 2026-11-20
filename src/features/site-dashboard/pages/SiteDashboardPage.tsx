import { NotFoundPage, useCurrentContext } from '@/features/shell';
import { SiteDashboardView } from '../components/SiteDashboardView';
import { SiteTilesView } from '../components/SiteTilesView';
import { useSiteDashboard } from '../hooks/useSiteDashboard';
import { useSiteTiles } from '../hooks/useSiteTiles';

function SiteStatsDashboard() {
  const model = useSiteDashboard();
  if (!model) {return <NotFoundPage />;}
  return <SiteDashboardView {...model} />;
}

function SiteTilesDashboard() {
  const model = useSiteTiles();
  if (!model) {return <NotFoundPage />;}
  return <SiteTilesView {...model} />;
}

/** Site Dashboard: statistics for sponsor and CO users, the module tiles for a site user. */
export function SiteDashboardPage() {
  const { user } = useCurrentContext();
  return user?.userType === 'site' ? <SiteTilesDashboard /> : <SiteStatsDashboard />;
}
