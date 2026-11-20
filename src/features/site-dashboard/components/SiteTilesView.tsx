import { PageHeader, TileGrid, type TileView } from '@/components/layout';
import { SHELL_LABELS } from '@/features/shell/constants/shell.constants';
import { SITE_DASHBOARD_LABELS as L } from '../constants/site-dashboard.constants';

interface SiteTilesViewProps {
  title: string;
  description: string;
  tiles: TileView[];
}

/** The site user's Site Dashboard: the site banner and one tile per module they may open (Site p.4). */
export function SiteTilesView({ title, description, tiles }: SiteTilesViewProps) {
  return (
    <div className="page-container">
      <PageHeader title={L.title} description={`${title} · ${description}`} />
      {tiles.length ? <TileGrid tiles={tiles} /> : <p className="section-card text-ink-500">{SHELL_LABELS.noTiles}</p>}
    </div>
  );
}
