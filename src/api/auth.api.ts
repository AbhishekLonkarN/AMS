import type { LoginErrorCode } from '@/types';
import { ApiError, postJson } from './api.client';

/** User returned by the backend login (backend field names). */
export interface ApiUser {
  id: string;
  email: string;
  prefix: string;
  full_name: string;
  user_category: string;
  time_zone: string;
}

export type BackendLoginResult = { isSuccess: true; user: ApiUser } | { isSuccess: false; error: LoginErrorCode };

const LOGIN_ERROR_BY_CODE: Record<string, LoginErrorCode> = {
  invalid_credentials: 'invalidCredentials',
  validation_error: 'invalidCredentials',
  no_access: 'noAccess',
  account_inactive: 'inactive',
};

/** Checks email + password with the backend. */
export async function loginRequest(email: string, password: string): Promise<BackendLoginResult> {
  try {
    const { user } = await postJson<{ status: 'ok'; user: ApiUser }>('/api/v1/auth/login', { email, password });
    return { isSuccess: true, user };
  } catch (error) {
    const code = error instanceof ApiError ? error.code : null;
    return { isSuccess: false, error: (code && LOGIN_ERROR_BY_CODE[code]) || 'unavailable' };
  }
}
