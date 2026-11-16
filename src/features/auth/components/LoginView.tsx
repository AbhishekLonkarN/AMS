import type { FormEventHandler } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Link } from 'react-router-dom';
import type { DemoUserOption } from '@/components/layout';
import { ROUTES } from '@/app/router/route-paths.constants';
import { LOGIN_LABELS } from '../constants/auth.constants';
import type { LoginFormValues } from '../schemas/login.schema';
import clintechLogo from '@/assets/clintech-logo.png';
import { AuthField } from './AuthField';
import { AuthLayout } from './AuthLayout';
import { AuthFooter } from './AuthParts';
import { DemoUserList } from './DemoUserList';
import styles from './AuthPage.module.css';

interface LoginViewProps {
  form: UseFormReturn<LoginFormValues>;
  loginError: string | null;
  demoUsers: DemoUserOption[];
  onSubmit: FormEventHandler<HTMLFormElement>;
  onDemoLogin: (userId: string) => void;
}

export function LoginView({ form, loginError, demoUsers, onSubmit, onDemoLogin }: LoginViewProps) {
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <AuthLayout>
      <div className={styles.mainCol}>
        <div className={styles.head}>
          <img className={styles.logo} src={clintechLogo} alt="ClinTech" />
          <div>
            <h1 className={styles.title}>{LOGIN_LABELS.title}</h1>
            <p className={styles.sub}>{LOGIN_LABELS.subtitle}</p>
            <p className={styles.desc}>{LOGIN_LABELS.description}</p>
          </div>
        </div>

        {loginError && (
          <div role="alert" className={styles.alert}>
            {loginError}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          <AuthField
            id="login-email"
            label={LOGIN_LABELS.email}
            icon="user"
            type="email"
            placeholder={LOGIN_LABELS.emailPlaceholder}
            autoComplete="username"
            error={errors.email?.message}
            registration={register('email')}
          />
          <AuthField
            id="login-password"
            label={LOGIN_LABELS.password}
            icon="lock"
            type="password"
            placeholder={LOGIN_LABELS.passwordPlaceholder}
            autoComplete="current-password"
            error={errors.password?.message}
            registration={register('password')}
          />

          <button type="submit" className={styles.btn} disabled={formState.isSubmitting}>
            {LOGIN_LABELS.submit}
          </button>
        </form>

        <Link className={styles.forgot} to={ROUTES.forgotPassword}>
          {LOGIN_LABELS.forgot}
        </Link>
      </div>

      <div className={styles.sideCol}>
        <div className={styles.demo}>
          <DemoUserList users={demoUsers} onSelect={onDemoLogin} />
        </div>

        <AuthFooter />
      </div>
    </AuthLayout>
  );
}
