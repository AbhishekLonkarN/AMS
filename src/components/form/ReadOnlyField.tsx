import type { ReactNode } from 'react';
import clsx from 'clsx';
import { FORM_LABELS } from './form.constants';
import styles from './ReadOnlyField.module.css';

interface ReadOnlyFieldProps {
  label: string;
  value?: ReactNode;
  isFullWidth?: boolean;
}

/** Label + value for View modes and auto-filled fields. */
export function ReadOnlyField({ label, value, isFullWidth }: ReadOnlyFieldProps) {
  const isEmpty = value === undefined || value === null || value === '';
  return (
    <div className={clsx(styles.field, isFullWidth && styles.fullWidth)}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{isEmpty ? FORM_LABELS.readOnlyEmpty : value}</span>
    </div>
  );
}
