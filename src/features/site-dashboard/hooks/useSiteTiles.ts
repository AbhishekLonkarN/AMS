import { useParams } from 'react-router-dom';
import { useSitesStore } from '@/store';
import { useHubTiles } from '@/features/shell';

/** Tiles of the site user's Site Dashboard: every module of the site except the dashboard itself. */
export function useSiteTiles() {
  const { projectId, siteId } = useParams();
  const site = useSitesStore((s) => s.sites.find((x) => x.id === siteId && x.projectId === projectId));
  // The Site document's tiles carry the module name only.
  const tiles = useHubTiles('site')
    .filter((t) => t.key !== 'site-dashboard')
    .map(({ description: _description, ...tile }) => tile);
  if (!site) {return null;}
  return {
    title: `${site.siteCode} · ${site.siteName}`,
    description: `${site.investigatorName} · ${site.location}`,
    tiles,
  };
}
