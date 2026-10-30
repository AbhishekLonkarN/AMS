import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FORM_LABELS } from './form.constants';
import styles from './FormActions.module.css';

interface FormActionsProps {
  submitLabel?: string;
  cancelLabel?: string;
  /** Link target for Cancel (pages). */
  cancelTo?: string;
  /** Handler for Cancel (modals). */
  onCancel?: () => void;
  isSubmitting?: boolean;
  isSubmitDisabled?: boolean;
  /** Extra content on the left (e.g. "customised" note). */
  extra?: ReactNode;
}

export function FormActions({
  submitLabel = FORM_LABELS.save,
  cancelLabel = FORM_LABELS.cancel,
  cancelTo,
  onCancel,
  isSubmitting,
  isSubmitDisabled,
  extra,
}: FormActionsProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.extra}>{extra}</div>
      {cancelTo && (
        <Link to={cancelTo} className="btn btn-ghost">
          {cancelLabel}
        </Link>
      )}
      {onCancel && (
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          {cancelLabel}
        </button>
      )}
      <button type="submit" className="btn btn-primary" disabled={isSubmitting || isSubmitDisabled}>
        {isSubmitting && <span className="loading loading-spinner loading-sm" aria-hidden />}
        {submitLabel}
      </button>
    </div>
  );
}
