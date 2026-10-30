import type { LoginErrorCode } from '@/types';

/** One user per role for the demo switcher (login page + header). */
export const DEMO_USERS = [
  { userId: 'usr-abcd', roleLabel: 'Admin' },
  { userId: 'usr-jpatel', roleLabel: 'Head-Sponsor' },
  { userId: 'usr-kbhatt', roleLabel: 'PM-Sponsor' },
  { userId: 'usr-akulkarni', roleLabel: 'QA Auditor' },
  { userId: 'usr-amartin', roleLabel: 'CRA-CO' },
  { userId: 'usr-pchevalier', roleLabel: 'Investigator' },
  { userId: 'usr-dyna', roleLabel: 'CRC' },
] as const;

export const LOGIN_LABELS = {
  title: 'Sign in',
  subtitle: 'Use your registered email ID (User ID).',
  email: 'Email ID (User ID)',
  emailPlaceholder: 'name@company.com',
  password: 'Password',
  passwordPlaceholder: 'Any password works in this prototype',
  submit: 'Sign in',
  demoTitle: 'Quick demo sign-in',
  demoHint: 'One user per role. Every switch is recorded in the audit trail.',
  brandTagline: 'Electronic Data Capture for medical-device clinical investigations',
  brandPoints: [
    'Role-based access per project and site',
    'Full audit trail of every change',
    'Built for EU CE Mark and CDSCO submissions',
  ],
  prototypeNote: 'Prototype · dummy data only',
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
