import { createContext, useContext } from 'react';

interface DrawerContextValue {
  /** Lets drawer content (header close button, Cancel) close the drawer it sits in. */
  close: () => void;
  /** The open <dialog>: floating popups must portal into it to stay in the browser's top layer. */
  portalRoot: HTMLElement | null;
}

export const DrawerContext = createContext<DrawerContextValue>({ close: () => {}, portalRoot: null });

export const useDrawerClose = () => useContext(DrawerContext).close;

/** Portal root for Floating UI popups inside a drawer (undefined → document.body). */
export const useDrawerPortalRoot = () => useContext(DrawerContext).portalRoot ?? undefined;
