import { create } from 'zustand';
import { createId } from '@/utils/id.utils';

export type ToastTone = 'success' | 'info' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  tone: ToastTone;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  showToast: (tone: ToastTone, message: string) => void;
  dismissToast: (id: string) => void;
}

const AUTO_DISMISS_MS = 4000;

/** UI-only store (never persisted). */
export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  showToast: (tone, message) => {
    const id = createId('toast');
    set((s) => ({ toasts: [...s.toasts, { id, tone, message }] }));
    setTimeout(() => get().dismissToast(id), AUTO_DISMISS_MS);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const PHASE2_MESSAGE = 'Available in Phase 2.';

/** Call from hooks/handlers: `notify.success('Saved')`. */
export const notify = {
  success: (message: string) => useToastStore.getState().showToast('success', message),
  info: (message: string) => useToastStore.getState().showToast('info', message),
  warning: (message: string) => useToastStore.getState().showToast('warning', message),
  error: (message: string) => useToastStore.getState().showToast('error', message),
  phase2: (what?: string) => useToastStore.getState().showToast('info', what ? `${what}: ${PHASE2_MESSAGE}` : PHASE2_MESSAGE),
};
