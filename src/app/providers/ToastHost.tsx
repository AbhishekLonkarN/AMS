import { ToastViewport } from '@/components/feedback';
import { useToastStore } from '@/store';

/** Connects the toast store to the presentational viewport. */
export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);
  return <ToastViewport toasts={toasts} onDismiss={dismissToast} />;
}
