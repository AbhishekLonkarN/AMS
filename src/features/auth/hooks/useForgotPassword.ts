import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { recordAudit } from '@/store';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { ROUTES } from '@/app/router/route-paths.constants';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas/forgot-password.schema';
import { useFlowEmail, type ResetFlowState } from './useFlowEmail';

export function useForgotPassword() {
  const navigate = useNavigate();
  const previousEmail = useFlowEmail();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: previousEmail ?? '' },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  // The next page looks the same whether or not the address is registered, so it cannot be used to find out who has an account.
  const handleSubmit = form.handleSubmit(({ email }) => {
    recordAudit({ page: AUDIT_PAGES.login, event: `Password reset link requested for User ${email}`, actorEmail: null });
    const state: ResetFlowState = { email };
    navigate(ROUTES.forgotPasswordSent, { state });
  });

  return { form, handleSubmit };
}
