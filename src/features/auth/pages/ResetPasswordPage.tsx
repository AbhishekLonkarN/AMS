import { Navigate } from 'react-router-dom';
import { useSessionStore } from '@/store';
import { ROUTES } from '@/app/router/route-paths.constants';
import { ResetPasswordView } from '../components/ResetPasswordView';
import { useFlowEmail } from '../hooks/useFlowEmail';
import { useResetPassword } from '../hooks/useResetPassword';

export function ResetPasswordPage() {
  const isLoggedIn = useSessionStore((s) => !!s.currentUserId);
  const email = useFlowEmail();

  if (isLoggedIn) {return <Navigate to={ROUTES.root} replace />;}
  // A real reset link carries a token; the prototype carries the email from the first step instead.
  if (!email) {return <Navigate to={ROUTES.forgotPassword} replace />;}

  return <ResetPasswordContent email={email} />;
}

function ResetPasswordContent({ email }: { email: string }) {
  const { form, check, handleSubmit } = useResetPassword(email);

  return <ResetPasswordView form={form} check={check} onSubmit={handleSubmit} />;
}
