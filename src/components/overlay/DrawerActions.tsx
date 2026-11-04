import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { useDrawerClose } from './drawer.context';
import { OVERLAY_LABELS } from './overlay.constants';
import styles from './DrawerActions.module.css';

interface DrawerActionsProps {
  cancelLabel?: string;
  /** Defaults to closing the drawer. */
  onCancel?: () => void;
  primaryLabel?: string;
  primaryIcon?: LucideIcon;
  /** Submit the form with this id (the footer sits outside the form). */
  formId?: string;
  /** Or a plain click handler. */
  onPrimary?: () => void;
  isPrimaryDisabled?: boolean;
  isBusy?: boolean;
}

/** Footer buttons: Cancel on the left, primary on the right; each takes half the width. */
export function DrawerActions({
  cancelLabel = OVERLAY_LABELS.cancel,
  onCancel,
  primaryLabel,
  primaryIcon: PrimaryIcon,
  formId,
  onPrimary,
  isPrimaryDisabled,
  isBusy,
}: DrawerActionsProps) {
  const close = useDrawerClose();
  const hasPrimary = !!primaryLabel;

  return (
    <div className={clsx(styles.actions, hasPrimary && styles.twoUp)}>
      <button type="button" data-btn="cancel" className={clsx('btn', styles.cancel)} onClick={onCancel ?? close}>
        {cancelLabel}
      </button>
      {hasPrimary && (
        <button
          type={formId ? 'submit' : 'button'}
          form={formId}
          className="btn btn-primary"
          disabled={isPrimaryDisabled || isBusy}
          onClick={onPrimary}
        >
          {isBusy && <span className="loading loading-spinner loading-sm" aria-hidden />}
          {PrimaryIcon && !isBusy && <PrimaryIcon className="size-4" aria-hidden />}
          {primaryLabel}
        </button>
      )}
    </div>
  );
}
