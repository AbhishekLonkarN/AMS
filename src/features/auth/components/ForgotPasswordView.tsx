import type { FormEventHandler } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { ROUTES } from '@/app/router/route-paths.constants';
import { FORGOT_LABELS, LOGIN_LABELS } from '../constants/auth.constants';
import type { ForgotPasswordFormValues } from '../schemas/forgot-password.schema';
import { AuthField } from './AuthField';
import { AuthLayout } from './AuthLayout';
import clintechLogo from '@/assets/clintech-logo.png';
import { AuthFooter, AuthNote } from './AuthParts';
import styles from './AuthPage.module.css';

interface ForgotPasswordViewProps {
  form: UseFormReturn<ForgotPasswordFormValues>;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

/** Step 1: ask for the account email. */
export function ForgotPasswordView({ form, onSubmit }: ForgotPasswordViewProps) {
  const { register, formState } = form;

  return (
    <AuthLayout>
      <div className={styles.flowCol}>
        {/* same header as the login page: the logo first, then the title and a line of explanation */}
        <div className={styles.head}>
          <img className={styles.logo} src={clintechLogo} alt="ClinTech" />
          <div>
            <h1 className={styles.title}>{FORGOT_LABELS.title}</h1>
            <p className={styles.headText}>{FORGOT_LABELS.description}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} noValidate>
          <AuthField
            id="forgot-email"
            label={LOGIN_LABELS.email}
            icon="mail"
            type="email"
            placeholder={LOGIN_LABELS.emailPlaceholder}
            autoComplete="username"
            error={formState.errors.email?.message}
            registration={register('email')}
          />
          <button type="submit" className={styles.btn} disabled={formState.isSubmitting}>
            {FORGOT_LABELS.submit}
          </button>
        </form>

        <AuthNote icon={<ShieldCheck aria-hidden />}>{FORGOT_LABELS.security}</AuthNote>

        <p className={styles.altLine}>
          {FORGOT_LABELS.remember} <Link to={ROUTES.login}>{FORGOT_LABELS.login}</Link>
        </p>

        <AuthFooter />
      </div>
    </AuthLayout>
  );
}
