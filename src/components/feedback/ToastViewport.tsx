import { CircleAlert, CircleCheck, Info, TriangleAlert, X, type LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { FEEDBACK_LABELS } from './feedback.constants';
import styles from './ToastViewport.module.css';

export type ToastViewTone = 'success' | 'info' | 'warning' | 'error';

export interface ToastView {
  id: string;
  tone: ToastViewTone;
  message: string;
}

interface ToastViewportProps {
  toasts: ToastView[];
  onDismiss: (id: string) => void;
}

const TONE: Record<ToastViewTone, { className: string; icon: LucideIcon }> = {
  success: { className: 'alert-success', icon: CircleCheck },
  info: { className: 'alert-info', icon: Info },
  warning: { className: 'alert-warning', icon: TriangleAlert },
  error: { className: 'alert-error', icon: CircleAlert },
};

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  return (
    <div className={clsx('toast toast-end toast-bottom', styles.viewport)} role="status" aria-live="polite">
      {toasts.map((toast) => {
        const { className, icon: Icon } = TONE[toast.tone];
        return (
          <div key={toast.id} className={clsx('alert alert-soft', className, styles.toast)}>
            <Icon className="size-5 shrink-0" aria-hidden />
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-square"
              aria-label={FEEDBACK_LABELS.dismiss}
              onClick={() => onDismiss(toast.id)}
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        );
      })}
    </div>
  );
}
