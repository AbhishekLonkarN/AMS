import type { LoginErrorCode } from '@/types';
import { USER_TYPE_LABELS } from '@/constants/user.constants';

/** One user per user type for the demo switcher (login page + header). */
export const DEMO_USERS = [
  { userId: 'usr-abcd', roleLabel: USER_TYPE_LABELS.admin },
  { userId: 'usr-jpatel', roleLabel: USER_TYPE_LABELS.sponsor },
  { userId: 'usr-amartin', roleLabel: USER_TYPE_LABELS.co },
  { userId: 'usr-pchevalier', roleLabel: USER_TYPE_LABELS.site },
] as const;

export const LOGIN_LABELS = {
  title: 'Welcome to ClinTech',
  subtitle: 'Sign in to your account',
  description: 'Access your authorized clinical research workspace.',
  email: 'Email ID (User ID)',
  emailPlaceholder: 'Enter your registered email address',
  password: 'Password',
  passwordPlaceholder: 'Enter your password',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  submit: 'Login',
  forgot: 'Forgot password?',
  poweredBy: 'Powered by',
  demoTitle: 'Quick demo sign-in',
  demoHint: 'One user per user type. Every switch is recorded in the audit trail.',
  heroTitle: 'Clinical research,',
  heroTitleEmphasis: 'simplified.',
  heroText: 'Manage clinical study data, participant records, and electronic case report forms in one centralized platform.',
} as const;

export const LOGIN_ERRORS: Record<LoginErrorCode, string> = {
  // generic on purpose: it must not reveal whether an email address is registered
  notFound: 'Invalid email address or password.',
  inactive: 'This user account is In-active. Contact your administrator.',
  noActiveMembership: 'You are not an active member of any site. Contact your sponsor or CRO.',
};

/** Longest valid email address (RFC 5321). */
export const EMAIL_MAX_LENGTH = 254;

/** Something@something.something with no spaces anywhere. Only a format check: it cannot tell whether the address exists. */
export const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LOGIN_VALIDATION = {
  emailRequired: 'Email address is required.',
  emailInvalid: 'Please enter a valid email address.',
  emailTooLong: 'Email address is too long.',
  passwordRequired: 'Password is required.',
} as const;

export const PICKER_LABELS = {
  title: 'Choose a project and site',
  description: 'You belong to more than one site. Pick where you want to work.',
  empty: 'You are not affiliated to any active site yet.',
  investigator: 'PI',
} as const;

// ---- forgot / reset password ------------------------------------------------

/** How long a reset link works, and how long before it can be sent again. */
export const RESET_LINK_MINUTES = 30;
export const RESEND_WAIT_SECONDS = 30;

export const NEW_PASSWORD_MIN_LENGTH = 8;
export const NEW_PASSWORD_MAX_LENGTH = 128;

/**
 * Rules for a NEW password (reset only). Signing in has no such rules, so existing users can always log in
 * with the password they registered.
 */
export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (v: string) => v.length >= NEW_PASSWORD_MIN_LENGTH },
  { id: 'case', label: 'Upper and lower case', test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { id: 'number', label: 'At least one number', test: (v: string) => /\d/.test(v) },
  { id: 'special', label: 'One special character', test: (v: string) => /[^A-Za-z0-9\s]/.test(v) },
] as const;

/** Strength label for 0 to 4 rules met. */
export const PASSWORD_STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'] as const;

export const FORGOT_LABELS = {
  backToLogin: 'Back to login',
  title: 'Forgot your password?',
  description: 'Enter the email address linked to your account and we will send you a link to reset your password.',
  submit: 'Send reset link',
  security: `For your security, the link works for ${RESET_LINK_MINUTES} minutes and can be used once. If the address is registered, you will get an email shortly.`,
  remember: 'Remember your password?',
  login: 'Login',
} as const;

export const SENT_LABELS = {
  changeEmail: 'Change email',
  title: 'Check your email',
  intro: 'We have sent a password reset link to',
  // validity: `The link works for ${RESET_LINK_MINUTES} minutes and can be used once.`,
  openLink: 'Open the reset link',
  backToLogin: 'Back to login',
  helpTitle: 'Did not get the email?',
  tipSpam: 'Check your spam or junk folder.',
  tipAddress: 'Make sure you typed the address linked to your account.',
  resend: 'Resend the link',
  resendIn: (time: string) => `available in ${time}`,
  resent: 'A new reset link has been sent.',
} as const;

export const RESET_LABELS = {
  backToLogin: 'Back to login',
  title: 'Create a new password',
  description: 'Choose a strong password that you have not used before on this account.',
  newPassword: 'New password',
  newPlaceholder: 'Enter your new password',
  confirmPassword: 'Confirm new password',
  confirmPlaceholder: 'Re-enter your new password',
  submit: 'Reset password',
  strength: 'Password strength',
} as const;

export const RESET_VALIDATION = {
  passwordRequired: 'Password is required.',
  passwordWeak: 'Password does not meet all the requirements.',
  passwordTooLong: `Password can be at most ${NEW_PASSWORD_MAX_LENGTH} characters.`,
  confirmRequired: 'Confirm your new password.',
  confirmMismatch: 'Passwords do not match.',
} as const;

export const UPDATED_LABELS = {
  title: 'Password updated',
  description: 'Your password has been changed. Use your new password the next time you log in.',
  backToLogin: 'Back to login',
  note: 'You were signed out of all other devices. If you did not make this change, contact your administrator right away.',
} as const;
