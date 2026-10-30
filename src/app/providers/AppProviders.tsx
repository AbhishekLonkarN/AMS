import type { ReactNode } from 'react';
import { ToastHost } from './ToastHost';

interface AppProvidersProps {
  children: ReactNode;
}

/** App-wide providers and global UI hosts. */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <>
      {children}
      <ToastHost />
    </>
  );
}
