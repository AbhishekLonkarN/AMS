import type { ReactNode } from 'react';
import { LOGIN_LABELS } from '../constants/auth.constants';
import heroBackground from '../assets/login-left-background.png';
import styles from './AuthPage.module.css';

interface AuthLayoutProps {
  children: ReactNode;
}

/** The signed-out page frame: the tinted photo on the left, the white card on the right. Used by login, forgot and reset password. */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-hidden="true">
        <span className={styles.heroPhoto} style={{ backgroundImage: `url(${heroBackground})` }} />
        <span className={styles.heroTint} />
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
          <div className={styles.cardBody}>{children}</div>
        </div>
      </main>
    </div>
  );
}
