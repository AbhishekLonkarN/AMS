import type { ReactNode } from 'react';
import clsx from 'clsx';
import { Modal } from '@/components/overlay';
import { FEEDBACK_LABELS } from './feedback.constants';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` for Deactivate / Deaffiliate. */
  tone?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = FEEDBACK_LABELS.confirm,
  cancelLabel = FEEDBACK_LABELS.cancel,
  tone = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      size="sm"
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={clsx('btn', tone === 'danger' ? 'btn-error' : 'btn-primary')}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="text-body text-ink-700">{message}</div>
    </Modal>
  );
}
