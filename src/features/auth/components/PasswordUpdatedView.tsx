import { Link } from 'react-router-dom';
import { Check, Info } from 'lucide-react';
import { ROUTES } from '@/app/router/route-paths.constants';
import { UPDATED_LABELS } from '../constants/auth.constants';
import { AuthLayout } from './AuthLayout';
import { AuthCardTop, AuthFooter, AuthNote, AuthStateHead } from './AuthParts';
import styles from './AuthPage.module.css';

/** Step 4: the password was changed. */
export function PasswordUpdatedView() {
  return (
    <AuthLayout>
      <div className={styles.flowCol}>
        <AuthCardTop />

        <AuthStateHead icon={<Check aria-hidden />} title={UPDATED_LABELS.title} isLargeBadge>
          <p className={styles.stateText}>{UPDATED_LABELS.description}</p>
        </AuthStateHead>

        <Link to={ROUTES.login} className={`${styles.btn} ${styles.btnLink}`}>
          {UPDATED_LABELS.backToLogin}
        </Link>

        <AuthNote icon={<Info aria-hidden />}>{UPDATED_LABELS.note}</AuthNote>

        <AuthFooter />
      </div>
    </AuthLayout>
  );
}
