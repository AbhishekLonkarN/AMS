import type { User } from './user.types';

export type LoginErrorCode = 'notFound' | 'inactive' | 'noActiveMembership';

export type LoginResult = { isSuccess: true; user: User } | { isSuccess: false; error: LoginErrorCode };
