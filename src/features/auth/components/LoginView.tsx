import type { FormEventHandler } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Activity, CheckCircle2, LogIn } from 'lucide-react';
import type { DemoUserOption } from '@/components/layout';
import { LOGIN_LABELS } from '../constants/auth.constants';
import type { LoginFormValues } from '../schemas/login.schema';
import { DemoUserList } from './DemoUserList';
import styles from './LoginView.module.css';

interface LoginViewProps {
  softwareName: string;
  ownerName: string;
  form: UseFormReturn<LoginFormValues>;
  loginError: string | null;
  demoUsers: DemoUserOption[];
  onSubmit: FormEventHandler<HTMLFormElement>;
  onDemoLogin: (userId: string) => void;
}

export function LoginView({ softwareName, ownerName, form, loginError, demoUsers, onSubmit, onDemoLogin }: LoginViewProps) {
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <div className={styles.page}>
      <section className={styles.brandPanel}>
        <div className={styles.brandTop}>
          <span className={styles.brandMark}>
            <Activity aria-hidden />
          </span>
          <span>
            <span className={styles.brandName}>{softwareName}</span>
            <span className={styles.brandOwner}>{ownerName}</span>
          </span>
        </div>
        <div>
          <p className={styles.tagline}>{LOGIN_LABELS.brandTagline}</p>
          <ul className={styles.points}>
            {LOGIN_LABELS.brandPoints.map((point) => (
              <li key={point} className={styles.point}>
                <CheckCircle2 className="size-4 shrink-0 text-accent" aria-hidden /> {point}
              </li>
            ))}
          </ul>
        </div>
        <p className={styles.note}>{LOGIN_LABELS.prototypeNote}</p>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.formCard}>
          <h1 className={styles.title}>{LOGIN_LABELS.title}</h1>
          <p className={styles.subtitle}>{LOGIN_LABELS.subtitle}</p>

          {loginError && (
            <div role="alert" className="alert alert-error alert-soft">
              {loginError}
            </div>
          )}

          <form onSubmit={onSubmit} noValidate className={styles.form}>
            <label className="fieldset">
              <span className="fieldset-legend">{LOGIN_LABELS.email}</span>
              <input
                type="email"
                autoComplete="username"
                className="input w-full"
                placeholder={LOGIN_LABELS.emailPlaceholder}
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && <span className="text-caption text-error">{errors.email.message}</span>}
            </label>
            <label className="fieldset">
              <span className="fieldset-legend">{LOGIN_LABELS.password}</span>
              <input
                type="password"
                autoComplete="current-password"
                className="input w-full"
                placeholder={LOGIN_LABELS.passwordPlaceholder}
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              {errors.password && <span className="text-caption text-error">{errors.password.message}</span>}
            </label>
            <button type="submit" className="btn btn-primary w-full">
              <LogIn className="size-4" aria-hidden /> {LOGIN_LABELS.submit}
            </button>
          </form>

          <DemoUserList users={demoUsers} onSelect={onDemoLogin} />
        </div>
      </section>
    </div>
  );
}
