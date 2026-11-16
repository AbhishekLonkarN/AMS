import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/app/router/route-paths.constants';
import { SENT_LABELS } from '../constants/auth.constants';
import { formatCountdown } from '../hooks/useResendCountdown';
import type { ResetFlowState } from '../hooks/useFlowEmail';
import { maskEmail } from '../utils/mask-email.utils';
import { AuthLayout } from './AuthLayout';
import clintechLogo from '@/assets/clintech-logo.png';
import { AuthFooter } from './AuthParts';
import styles from './AuthPage.module.css';

interface CheckEmailViewProps {
  email: string;
  secondsLeft: number;
  canResend: boolean;
  onResend: () => void;
}

/** Step 2: tell the user the link was sent, and offer help if it does not arrive. */
export function CheckEmailView({ email, secondsLeft, canResend, onResend }: CheckEmailViewProps) {
  const flowState: ResetFlowState = { email };

  return (
    <AuthLayout>
      <div className={styles.flowCol}>
        {/* same header as the login page: the logo first, then the title and where the link went */}
        <div className={styles.head}>
          <img className={styles.logo} src={clintechLogo} alt="ClinTech" />
          <div>
            <h1 className={styles.title}>{SENT_LABELS.title}</h1>
            <p className={styles.headText}>{SENT_LABELS.intro}</p>
            <div className={styles.emailRow}>
              <span className={styles.maskedEmail}>{maskEmail(email)}</span>
              <Link className={styles.backLink} to={ROUTES.forgotPassword} state={flowState}>
                <ArrowLeft aria-hidden />
                {SENT_LABELS.changeEmail}
              </Link>
            </div>
          </div>
        </div>

        {/* In the prototype no email is sent, so this button stands in for opening the link from the email. */}
        <Link to={ROUTES.resetPassword} state={flowState} className={`${styles.btn} ${styles.btnLink}`}>
          {SENT_LABELS.openLink}
        </Link>
        <Link to={ROUTES.login} className={styles.btnSecondary}>
          {SENT_LABELS.backToLogin}
        </Link>

        <div className={styles.helpBox}>
          <p className={styles.helpTitle}>{SENT_LABELS.helpTitle}</p>
          <ul className={styles.helpList}>
            <li>{SENT_LABELS.tipSpam}</li>
            <li>{SENT_LABELS.tipAddress}</li>
          </ul>
          <p className={styles.resendRow}>
            {canResend ? (
              <button type="button" className={styles.resendLink} onClick={onResend}>
                {SENT_LABELS.resend}
              </button>
            ) : (
              <>
                <span className={styles.resendMuted}>{SENT_LABELS.resend}</span>{' '}
                <span className={styles.resendWait}>· {SENT_LABELS.resendIn(formatCountdown(secondsLeft))}</span>
              </>
            )}
          </p>
        </div>

        <AuthFooter />
      </div>
    </AuthLayout>
  );
}
