import { useState } from 'react';
import type { FormEventHandler } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { DemoUserOption } from '@/components/layout';
import { LOGIN_LABELS } from '../constants/auth.constants';
import type { LoginFormValues } from '../schemas/login.schema';
import amsLogo from '../assets/ams-logo.png';
import clintechLogo from '@/assets/clintech-logo.png';
import heroBackground from '../assets/login-left-background.png';
import { DemoUserList } from './DemoUserList';
import styles from './LoginView.module.css';

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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.page}>
      <section className={styles.hero} style={{ backgroundImage: `url(${heroBackground})` }} aria-hidden="true">
        <div className={styles.intro}>
          <h2 className={styles.introTitle}>
            {LOGIN_LABELS.heroTitle} <em>{LOGIN_LABELS.heroTitleEmphasis}</em>
          </h2>
          <span className={styles.introRule} />
          <p className={styles.introText}>{LOGIN_LABELS.heroText}</p>
        </div>
      </section>

      <main className={styles.panel}>
        <div className={styles.card}>
          <div className={styles.cardBody}>
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
                <label className={styles.label} htmlFor="login-email">
                  {LOGIN_LABELS.email}
                </label>
                <div className={styles.field}>
                  <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
                  </svg>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="username"
                    className={styles.input}
                    placeholder={LOGIN_LABELS.emailPlaceholder}
                    aria-invalid={!!errors.email}
                    {...register('email')}
                  />
                  {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
                </div>

                <label className={styles.label} htmlFor="login-password">
                  {LOGIN_LABELS.password}
                </label>
                <div className={styles.field}>
                  <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden>
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M8 11V8a4 4 0 018 0v3" />
                  </svg>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={styles.input}
                    placeholder={LOGIN_LABELS.passwordPlaceholder}
                    aria-invalid={!!errors.password}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className={styles.eye}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? LOGIN_LABELS.hidePassword : LOGIN_LABELS.showPassword}
                  >
                    <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden>
                      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                      {showPassword && <path d="M4 4l16 16" />}
                    </svg>
                  </button>
                  {errors.password && <span className={styles.fieldError}>{errors.password.message}</span>}
                </div>

                <button type="submit" className={styles.btn}>
                  {LOGIN_LABELS.submit}
                </button>
              </form>

              <a className={styles.forgot} href="#" onClick={(e) => e.preventDefault()}>
                {LOGIN_LABELS.forgot}
              </a>
            </div>

            <div className={styles.sideCol}>
              <div className={styles.demo}>
                <DemoUserList users={demoUsers} onSelect={onDemoLogin} />
              </div>

              <div className={styles.footer}>
                <span>{LOGIN_LABELS.poweredBy}</span>
                <img src={amsLogo} alt="AMS - Advanced MedTech Solutions" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
