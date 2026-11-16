import { Navigate } from 'react-router-dom';
import { useSessionStore } from '@/store';
import { ROUTES } from '@/app/router/route-paths.constants';
import { ForgotPasswordView } from '../components/ForgotPasswordView';
import { useForgotPassword } from '../hooks/useForgotPassword';

export function ForgotPasswordPage() {
  const isLoggedIn = useSessionStore((s) => !!s.currentUserId);
  const { form, handleSubmit } = useForgotPassword();

  if (isLoggedIn) {return <Navigate to={ROUTES.root} replace />;}

  return <ForgotPasswordView form={form} onSubmit={handleSubmit} />;
}
