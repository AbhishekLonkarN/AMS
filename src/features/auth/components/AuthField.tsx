import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { LOGIN_LABELS } from '../constants/auth.constants';
import styles from './AuthPage.module.css';

const ICONS = { user: User, mail: Mail, lock: Lock } as const;

interface AuthFieldProps {
  id: string;
  label: string;
  icon: keyof typeof ICONS;
  type: 'email' | 'password';
  placeholder: string;
  autoComplete: string;
  error?: string;
  /** react-hook-form's register(...) result. */
  registration: UseFormRegisterReturn;
  /** No gap under the field, for content that follows it closely (the strength meter). */
  isCompact?: boolean;
}

/**
 * A required field of the signed-out pages: label with a red star, icon, input, inline error and,
 * for passwords, a show / hide button. Ids follow `<id>` and `<id>-error`.
 */
export function AuthField({ id, label, icon, type, placeholder, autoComplete, error, registration, isCompact }: AuthFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = ICONS[icon];
  const isPassword = type === 'password';
  const errorId = `${id}-error`;

  return (
    <>
      <label className={styles.label} htmlFor={id}>
        {label}
        <span className={styles.required} aria-hidden="true">
          *
        </span>
      </label>
      <div className={isCompact ? `${styles.field} ${styles.fieldCompact}` : styles.field}>
        <Icon className={styles.ico} aria-hidden />
        <input
          id={id}
          type={isPassword && isVisible ? 'text' : type}
          autoComplete={autoComplete}
          autoCapitalize={isPassword ? undefined : 'none'}
          spellCheck={false}
          className={styles.input}
          placeholder={placeholder}
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...registration}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.eye}
            onClick={() => setIsVisible((value) => !value)}
            aria-label={isVisible ? LOGIN_LABELS.hidePassword : LOGIN_LABELS.showPassword}
          >
            {isVisible ? <EyeOff className={styles.ico} aria-hidden /> : <Eye className={styles.ico} aria-hidden />}
          </button>
        )}
        {error && (
          <span id={errorId} role="alert" className={styles.fieldError}>
            {error}
          </span>
        )}
      </div>
    </>
  );
}
