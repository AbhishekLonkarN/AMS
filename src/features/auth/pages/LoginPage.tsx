import { Navigate } from 'react-router-dom';
import { useCompanyProfileStore, useSessionStore } from '@/store';
import { ROUTES } from '@/app/router/route-paths.constants';
import { LoginView } from '../components/LoginView';
import { useLogin } from '../hooks/useLogin';

export function LoginPage() {
  const isLoggedIn = useSessionStore((s) => !!s.currentUserId);
  const profile = useCompanyProfileStore((s) => s.profile);
  const { form, loginError, demoUsers, handleSubmit, handleDemoLogin } = useLogin();

  if (isLoggedIn) return <Navigate to={ROUTES.root} replace />;

  return (
    <LoginView
      softwareName={profile.softwareName}
      ownerName={profile.ownerDisplayName}
      form={form}
      loginError={loginError}
      demoUsers={demoUsers}
      onSubmit={handleSubmit}
      onDemoLogin={handleDemoLogin}
    />
  );
}
