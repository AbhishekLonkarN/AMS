import type { User } from './user.types';

export type LoginErrorCode =
  | 'notFound'
  | 'inactive'
  | 'noActiveMembership'
  | 'invalidCredentials'
  | 'noAccess'
  | 'unavailable'
  | 'notInDemoData';

export type LoginResult = { isSuccess: true; user: User } | { isSuccess: false; error: LoginErrorCode };
