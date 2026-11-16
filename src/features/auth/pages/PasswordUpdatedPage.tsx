import { Navigate } from 'react-router-dom';
import { useSessionStore } from '@/store';
import { ROUTES } from '@/app/router/route-paths.constants';
import { PasswordUpdatedView } from '../components/PasswordUpdatedView';
import { useFlowEmail } from '../hooks/useFlowEmail';

export function PasswordUpdatedPage() {
  const isLoggedIn = useSessionStore((s) => !!s.currentUserId);
  const email = useFlowEmail();

  if (isLoggedIn) {return <Navigate to={ROUTES.root} replace />;}
  // Only reachable by finishing the reset.
  if (!email) {return <Navigate to={ROUTES.login} replace />;}

  return <PasswordUpdatedView />;
}
