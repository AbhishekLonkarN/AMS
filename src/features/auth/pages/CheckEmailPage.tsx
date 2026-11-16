import { Navigate } from 'react-router-dom';
import { notify, recordAudit, useSessionStore } from '@/store';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { ROUTES } from '@/app/router/route-paths.constants';
import { CheckEmailView } from '../components/CheckEmailView';
import { RESEND_WAIT_SECONDS, SENT_LABELS } from '../constants/auth.constants';
import { useFlowEmail } from '../hooks/useFlowEmail';
import { useResendCountdown } from '../hooks/useResendCountdown';

export function CheckEmailPage() {
  const isLoggedIn = useSessionStore((s) => !!s.currentUserId);
  const email = useFlowEmail();

  if (isLoggedIn) {return <Navigate to={ROUTES.root} replace />;}
  // Opened directly, without the email from the first step: start from the beginning.
  if (!email) {return <Navigate to={ROUTES.forgotPassword} replace />;}

  return <CheckEmailContent email={email} />;
}

function CheckEmailContent({ email }: { email: string }) {
  const { remaining, isReady, restart } = useResendCountdown(RESEND_WAIT_SECONDS);

  const handleResend = () => {
    recordAudit({ page: AUDIT_PAGES.login, event: `Password reset link requested for User ${email}`, actorEmail: null });
    notify.success(SENT_LABELS.resent);
    restart();
  };

  return <CheckEmailView email={email} secondsLeft={remaining} canResend={isReady} onResend={handleResend} />;
}
