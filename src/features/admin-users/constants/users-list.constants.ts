import type { UserType } from '@/types';
import { ROUTES } from '@/app/router/route-paths.constants';

export const USERS_LIST_LABELS = {
  searchPlaceholder: 'Search name, email or organization…',
  createButton: 'Create User',
} as const;

export const USERS_COLUMN_LABELS = {
  name: 'Name',
  email: 'Email ID',
  type: 'Type',
  organization: 'Organization',
  status: 'User Status',
} as const;

/** Shown in the Type column and in the Create User menu. */
export const USERS_TYPE_LABELS: Record<Exclude<UserType, 'site'>, string> = {
  admin: 'Admin',
  sponsor: 'Sponsor',
  co: 'CO user',
};

export interface CreateUserOption {
  key: Exclude<UserType, 'site'>;
  label: string;
  /** Opens the create drawer; Sponsor / CO pre-select the account type with `?type=`. */
  to: string;
  permission: 'adminUser.new' | 'sponsorCoUser.new';
}

export const CREATE_USER_OPTIONS: CreateUserOption[] = [
  { key: 'admin', label: USERS_TYPE_LABELS.admin, to: ROUTES.adminUserNew, permission: 'adminUser.new' },
  { key: 'sponsor', label: USERS_TYPE_LABELS.sponsor, to: `${ROUTES.accountNew}?type=sponsor`, permission: 'sponsorCoUser.new' },
  { key: 'co', label: USERS_TYPE_LABELS.co, to: `${ROUTES.accountNew}?type=co`, permission: 'sponsorCoUser.new' },
];
