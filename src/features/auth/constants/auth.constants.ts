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
  emailPlaceholder: 'name@company.com',
  password: 'Password',
  passwordPlaceholder: 'Any password works in this prototype',
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
  notFound: 'No user is registered with this email ID.',
  inactive: 'This user account is In-active. Contact your administrator.',
  noActiveMembership: 'You are not an active member of any site. Contact your sponsor or CRO.',
};

export const LOGIN_VALIDATION = {
  emailRequired: 'Email ID is required.',
  emailInvalid: 'Enter a valid email ID.',
  passwordRequired: 'Password is required.',
} as const;

export const PICKER_LABELS = {
  title: 'Choose a project and site',
  description: 'You belong to more than one site. Pick where you want to work.',
  empty: 'You are not affiliated to any active site yet.',
  investigator: 'PI',
} as const;
