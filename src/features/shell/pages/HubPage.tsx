import { HubView } from '../components/HubView';
import { useHubPage } from '../hooks/useHubPage';
import type { HubKey } from '../hooks/useHubTiles';

interface HubPageProps {
  hub: HubKey;
}

export function HubPage({ hub }: HubPageProps) {
  const { title, description, tiles } = useHubPage(hub);
  return <HubView title={title} description={description} tiles={tiles} />;
}
