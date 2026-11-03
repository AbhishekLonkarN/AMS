import { useRef } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';

export type DrawerMode = 'create' | 'view' | 'edit';

/** Placeholder pattern for an unused mode (hooks must always be called). */
const NEVER = '/__no-drawer-route__';

interface RouteDrawerOptions {
  /** Omit when the drawer has no create mode (e.g. edit over a hub page). */
  createPath?: string;
  /** Omit when records have a page of their own instead of a View drawer. */
  viewPattern?: string;
  editPattern: string;
  /** Route param holding the record id, e.g. "userId". */
  paramKey: string;
  /** Where closing navigates (the list). */
  listPath: string;
}

interface DrawerTarget {
  mode: DrawerMode;
  id?: string;
}

/**
 * List + drawer driven by the URL: /list/new, /list/:id and /list/:id/edit open the
 * drawer over the list (deep-linkable; Back closes it). The last target is kept while
 * the drawer slides out so its content doesn't vanish mid-animation.
 */
export function useRouteDrawer({ createPath, viewPattern, editPattern, paramKey, listPath }: RouteDrawerOptions) {
  const navigate = useNavigate();
  const createMatch = useMatch(createPath ?? NEVER);
  const editMatch = useMatch(editPattern);
  const viewMatch = useMatch(viewPattern ?? NEVER);

  // "new" also matches the ":id" pattern, so create is checked first.
  const current: DrawerTarget | null = createMatch
    ? { mode: 'create' }
    : editMatch
      ? { mode: 'edit', id: editMatch.params[paramKey] }
      : viewMatch
        ? { mode: 'view', id: viewMatch.params[paramKey] }
        : null;

  const lastRef = useRef<DrawerTarget | null>(current);
  if (current) lastRef.current = current;
  const target = lastRef.current;

  return {
    isOpen: !!current,
    mode: target?.mode,
    id: target?.id,
    /** Remounts drawer content (fresh form / tab) whenever the target changes. */
    contentKey: target ? `${target.mode}:${target.id ?? 'new'}` : 'none',
    close: () => navigate(listPath),
  };
}
