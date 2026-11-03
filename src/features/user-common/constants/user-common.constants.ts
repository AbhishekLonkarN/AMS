import type { SelectOption } from '@/components/form';
import { ACCOUNT_TYPE_LABELS, PREFIX_OPTIONS, RECORD_STATUS_LABELS } from '@/constants/user.constants';
import { TIME_ZONE_OPTIONS } from '@/constants/time-zone.constants';

export const USER_FIELD_LABELS = {
  prefix: 'Pre-fix',
  name: 'Name',
  email: 'Email ID (User ID)',
  organization: 'Organization',
  status: 'User Status',
  accountType: 'Account type',
  designation: 'Designation',
  timeZone: 'Time-zone of User',
  template: 'Default Access Rights Set',
  templateOptional: 'Prefill from Default Access Rights Set',
  createdAt: 'Created on',
  createdBy: 'Created by',
} as const;

export const USER_FIELD_HINTS = {
  templateOptional: 'Optional. Picking a set prefills the matrix below; you can still tick or untick boxes.',
  template: 'Prefills the matrix below; you can still tick or untick boxes.',
  ownStatus: 'You cannot deactivate your own account.',
  accountTypeLocked: 'Account type cannot change while the account is affiliated to a project or site.',
} as const;

export const USER_VALIDATION = {
  required: 'This field is required.',
  emailInvalid: 'Enter a valid email ID.',
  emailTaken: 'This email ID is already used by another user. One email ID can create only one user account.',
  templateRequired: 'Select a Default Access Rights Set.',
} as const;

export const USER_ACTION_LABELS = {
  view: 'View',
  edit: 'Edit',
  deactivate: 'Deactivate',
  reactivate: 'Re-activate',
  confirmDeactivateTitle: 'Deactivate user?',
  confirmReactivateTitle: 'Re-activate user?',
  confirmDeactivate: (name: string) => `${name} will be set to In-active and will no longer be able to log in.`,
  confirmReactivate: (name: string) => `${name} will be set to Active and will be able to log in again.`,
  deactivated: (name: string) => `${name} has been deactivated.`,
  reactivated: (name: string) => `${name} has been re-activated.`,
  created: (name: string) => `${name} has been created.`,
  saved: (name: string) => `Changes to ${name} have been saved.`,
} as const;

export const PREFIX_SELECT_OPTIONS: SelectOption[] = PREFIX_OPTIONS.map((p) => ({ value: p, label: p }));

export const STATUS_SELECT_OPTIONS: SelectOption[] = Object.entries(RECORD_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const ACCOUNT_TYPE_SELECT_OPTIONS: SelectOption[] = Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const TIME_ZONE_SELECT_OPTIONS: SelectOption[] = TIME_ZONE_OPTIONS.map((o) => ({ value: o.value, label: o.label }));
