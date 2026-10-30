import { useMatches } from 'react-router-dom';
import type { Scope } from '@/types';

export interface RouteContextParams {
  projectId?: string;
  siteId?: string;
}

/** Project/site ids from the deepest matched route (works from layouts too). */
export function useRouteParams(): RouteContextParams {
  const matches = useMatches();
  const params = matches[matches.length - 1]?.params ?? {};
  return { projectId: params.projectId, siteId: params.siteId };
}

/** Scope implied by the current URL: site > project > none ("anywhere"). */
export function useRouteScope(): Scope | undefined {
  const { projectId, siteId } = useRouteParams();
  if (projectId && siteId) return { type: 'site', projectId, siteId };
  if (projectId) return { type: 'project', projectId };
  return undefined;
}
