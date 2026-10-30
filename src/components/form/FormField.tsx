import type { ReactNode } from 'react';
import clsx from 'clsx';
import type { FieldChromeProps } from './form.types';
import { FORM_LABELS } from './form.constants';
import styles from './FormField.module.css';

interface FormFieldProps extends FieldChromeProps {
  htmlFor?: string;
  children: ReactNode;
}

/** Label + control + hint/error. Use directly for custom controls. */
export function FormField({ label, hint, error, isRequired, isFullWidth, htmlFor, children }: FormFieldProps) {
  const messageId = htmlFor ? `${htmlFor}-message` : undefined;
  return (
    <div className={clsx(styles.field, isFullWidth && styles.fullWidth)}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
        {isRequired && (
          <span className={styles.required} aria-label={FORM_LABELS.required}>
            {FORM_LABELS.requiredMark}
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={messageId} role="alert" className={styles.error}>
          {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}
