import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/app/router/route-paths.constants';
import { useHubTiles } from '../hooks/useHubTiles';

/** `/masters` has no screen of its own: open Default Access Rights, or the first master the user can see. */
export function MastersIndexPage() {
  const tiles = useHubTiles('masters');
  const target = tiles.find((t) => t.to === ROUTES.accessRights) ?? tiles[0];
  return <Navigate to={target?.to ?? ROUTES.forbidden} replace />;
}
