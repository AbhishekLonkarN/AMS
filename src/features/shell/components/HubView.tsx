import { PageHeader, TileGrid, type TileView } from '@/components/layout';
import { SHELL_LABELS } from '../constants/shell.constants';

interface HubViewProps {
  title: string;
  description?: string;
  tiles: TileView[];
}

export function HubView({ title, description, tiles }: HubViewProps) {
  return (
    <div className="page-container">
      <PageHeader title={title} description={description} />
      {tiles.length ? <TileGrid tiles={tiles} /> : <p className="section-card text-ink-500">{SHELL_LABELS.noTiles}</p>}
    </div>
  );
}
