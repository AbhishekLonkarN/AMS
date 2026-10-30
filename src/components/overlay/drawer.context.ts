import { createContext, useContext } from 'react';

/** Lets drawer content (header close button, Cancel) close the drawer it sits in. */
export const DrawerContext = createContext<{ close: () => void }>({ close: () => {} });

export const useDrawerClose = () => useContext(DrawerContext).close;
