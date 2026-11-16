import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LOGIN_LABELS } from '../constants/auth.constants';
import amsLogo from '../assets/ams-logo.png';
import clintechLogo from '@/assets/clintech-logo.png';
import styles from './AuthPage.module.css';

interface AuthCardTopProps {
  /** Link shown at the right of the logo row; left out on the last step. */
  backTo?: string;
  backLabel?: string;
  backState?: unknown;
}

/** Logo on the left, an optional way back on the right, a thin line under both. */
export function AuthCardTop({ backTo, backLabel, backState }: AuthCardTopProps) {
  return (
    <div className={styles.cardTop}>
      <img className={styles.cardTopLogo} src={clintechLogo} alt="ClinTech" />
      {backTo && (
        <Link className={styles.backLink} to={backTo} state={backState}>
          <ArrowLeft aria-hidden />
          {backLabel}
        </Link>
      )}
    </div>
  );
}

interface AuthStateHeadProps {
  icon: ReactNode;
  title: string;
  /** The success screen uses the larger badge. */
  isLargeBadge?: boolean;
  children?: ReactNode;
}

/** A round mint badge with an icon, a title and the text under it. */
export function AuthStateHead({ icon, title, isLargeBadge, children }: AuthStateHeadProps) {
  return (
    <div className={styles.stateHead}>
      {isLargeBadge ? (
        <span className={styles.successOuter}>
          <span className={styles.successInner}>{icon}</span>
        </span>
      ) : (
        <span className={styles.badge}>{icon}</span>
      )}
      <h1 className={styles.stateTitle}>{title}</h1>
      {children}
    </div>
  );
}

/** A quiet box with an icon and a short note. */
export function AuthNote({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.noteBox}>
      {icon}
      <p className={styles.noteText}>{children}</p>
    </div>
  );
}

export function AuthFooter() {
  return (
    <div className={styles.footer}>
      <span>{LOGIN_LABELS.poweredBy}</span>
      <img src={amsLogo} alt="AMS - Advanced MedTech Solutions" />
    </div>
  );
}
