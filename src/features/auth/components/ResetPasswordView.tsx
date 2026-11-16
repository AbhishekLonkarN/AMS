import type { FormEventHandler } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { ROUTES } from '@/app/router/route-paths.constants';
import { RESET_LABELS } from '../constants/auth.constants';
import type { ResetPasswordFormValues } from '../schemas/reset-password.schema';
import type { PasswordCheck } from '../utils/password.utils';
import { AuthField } from './AuthField';
import { AuthLayout } from './AuthLayout';
import clintechLogo from '@/assets/clintech-logo.png';
import { AuthFooter } from './AuthParts';
import styles from './AuthPage.module.css';

const STRENGTH_SEGMENTS = [1, 2, 3, 4];

interface ResetPasswordViewProps {
  form: UseFormReturn<ResetPasswordFormValues>;
  check: PasswordCheck;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

/** Step 3: choose a new password, with a live checklist and strength meter. */
export function ResetPasswordView({ form, check, onSubmit }: ResetPasswordViewProps) {
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <AuthLayout>
      <div className={styles.flowCol}>
        {/* same header as the login page: the logo first, then the title and a line of explanation */}
        <div className={styles.head}>
          <img className={styles.logo} src={clintechLogo} alt="ClinTech" />
          <div>
            <h1 className={styles.title}>{RESET_LABELS.title}</h1>
            <p className={styles.headText}>{RESET_LABELS.description}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} noValidate>
          <AuthField
            id="reset-password"
            label={RESET_LABELS.newPassword}
            icon="lock"
            type="password"
            placeholder={RESET_LABELS.newPlaceholder}
            autoComplete="new-password"
            error={errors.password?.message}
            registration={register('password')}
            isCompact
          />

          <div className={styles.strength}>
            <div className={styles.strengthBars} role="img" aria-label={`${RESET_LABELS.strength}: ${check.label || 'none'}`}>
              {STRENGTH_SEGMENTS.map((segment) => (
                <span key={segment} className={segment <= check.score ? `${styles.strengthBar} ${styles.strengthBarOn}` : styles.strengthBar} />
              ))}
            </div>
            <span className={styles.strengthLabel}>{check.label}</span>
          </div>

          <ul className={styles.rules}>
            {check.rules.map((rule) => (
              <li key={rule.id} className={rule.met ? `${styles.rule} ${styles.ruleMet}` : styles.rule}>
                <span className={styles.ruleMark}>{rule.met && <Check aria-hidden />}</span>
                {rule.label}
              </li>
            ))}
          </ul>

          <AuthField
            id="reset-confirm"
            label={RESET_LABELS.confirmPassword}
            icon="lock"
            type="password"
            placeholder={RESET_LABELS.confirmPlaceholder}
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            registration={register('confirmPassword')}
          />

          <button type="submit" className={styles.btn} disabled={formState.isSubmitting}>
            {RESET_LABELS.submit}
          </button>
        </form>

        <Link to={ROUTES.login} className={styles.btnSecondary}>
          {RESET_LABELS.backToLogin}
        </Link>

        <AuthFooter />
      </div>
    </AuthLayout>
  );
}
