import { useLocation } from 'react-router-dom';

/** Router state carried through the forgot-password steps. */
export interface ResetFlowState {
  email: string;
}

/** The email entered on the first step, or undefined when a page is opened directly. */
export function useFlowEmail(): string | undefined {
  const state = useLocation().state as Partial<ResetFlowState> | null;
  return state?.email;
}
