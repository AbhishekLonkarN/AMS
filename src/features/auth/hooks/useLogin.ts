import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSessionStore } from '@/store';
import { ROUTES } from '@/app/router/route-paths.constants';
import { LOGIN_ERRORS } from '../constants/auth.constants';
import { loginSchema, type LoginFormValues } from '../schemas/login.schema';
import { useDemoUsers } from './useDemoUsers';

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useSessionStore((s) => s.login);
  const switchUser = useSessionStore((s) => s.switchUser);
  const demoUsers = useDemoUsers();
  const [loginError, setLoginError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Return to the page that bounced us to login, else the role's home (via "/").
  const redirectTo = (location.state as { from?: string } | null)?.from ?? ROUTES.root;

  const handleSubmit = form.handleSubmit(({ email }) => {
    const result = login(email);
    if (!result.isSuccess) {
      setLoginError(LOGIN_ERRORS[result.error]);
      return;
    }
    navigate(redirectTo, { replace: true });
  });

  const handleDemoLogin = (userId: string) => {
    const result = switchUser(userId);
    if (!result.isSuccess) {
      setLoginError(LOGIN_ERRORS[result.error]);
      return;
    }
    navigate(ROUTES.root, { replace: true });
  };

  return { form, loginError, demoUsers, handleSubmit, handleDemoLogin };
}
