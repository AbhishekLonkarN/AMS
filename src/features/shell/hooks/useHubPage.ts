import { HUB_DESCRIPTIONS, HUB_TITLES } from '../constants/shell.constants';
import { useCurrentContext } from './useCurrentContext';
import { useHubTiles, type HubKey } from './useHubTiles';

export function useHubPage(hub: HubKey) {
  const tiles = useHubTiles(hub);
  const { project, site } = useCurrentContext();

  if (hub === 'project') {
    return { tiles, title: project?.name ?? '', description: project?.description };
  }
  if (hub === 'site') {
    return {
      tiles,
      title: `${site?.siteCode} · ${site?.siteName}`,
      description: `${site?.investigatorName} · ${site?.location}`,
    };
  }
  return { tiles, title: HUB_TITLES[hub], description: HUB_DESCRIPTIONS[hub] };
}
