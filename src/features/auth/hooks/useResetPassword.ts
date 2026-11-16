import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { recordAudit } from '@/store';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { ROUTES } from '@/app/router/route-paths.constants';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../schemas/reset-password.schema';
import { checkNewPassword } from '../utils/password.utils';
import type { ResetFlowState } from './useFlowEmail';

export function useResetPassword(email: string) {
  const navigate = useNavigate();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  // Live feedback while typing: the checklist and the strength meter.
  const check = checkNewPassword(form.watch('password'));

  // The prototype has no password store, so the change is recorded in the audit trail only (never the password itself).
  const handleSubmit = form.handleSubmit(() => {
    recordAudit({ page: AUDIT_PAGES.login, event: `Password changed for User ${email}`, actorEmail: email });
    const state: ResetFlowState = { email };
    navigate(ROUTES.passwordUpdated, { state, replace: true });
  });

  return { form, check, handleSubmit };
}
