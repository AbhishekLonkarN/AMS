import type { SelectOption } from '@/components/form';
import type { UserType } from '@/types';
import { USER_TYPE_LABELS } from '@/constants/user.constants';

export const ACCESS_RIGHTS_LABELS = {
  listTitle: 'Master-Default Access Rights',
  listDescription: 'Access-rights templates. Picking one on a user or affiliation form prefills the matrix.',
  addButton: 'Add Master',
  createTitle: 'Add Master-Default Access Rights',
  editTitle: 'Edit Master-Default Access Rights',
  viewDescription: 'Access-rights set and the rights it grants.',
  detailsSection: 'Access rights set',
  matrixTitle: (userType: string) => `Access rights (${userType})`,
  pickUserType: 'Choose a user type to see its access-rights matrix.',
  usedBy: 'Used by',
  usedByValue: (count: number) => (count === 1 ? '1 user / affiliation' : `${count} users / affiliations`),
  submitCreate: 'Submit',
  submitEdit: 'Save',
  view: 'View',
  edit: 'Edit',
  deactivate: 'Deactivate',
  reactivate: 'Re-activate',
  confirmDeactivateTitle: 'Deactivate access rights set?',
  confirmReactivateTitle: 'Re-activate access rights set?',
  confirmDeactivate: (name: string) =>
    `“${name}” will be hidden from template dropdowns. Users and affiliations that already use it keep their rights.`,
  confirmReactivate: (name: string) => `“${name}” will be available in template dropdowns again.`,
  created: (name: string) => `“${name}” has been added.`,
  saved: (name: string) => `Changes to “${name}” have been saved.`,
  deactivated: (name: string) => `“${name}” has been deactivated.`,
  reactivated: (name: string) => `“${name}” has been re-activated.`,
  searchPlaceholder: 'Search set name…',
} as const;

export const ACCESS_RIGHTS_FIELDS = {
  name: 'Access Rights Set',
  userType: 'User type',
  userTypeLocked: 'User type cannot change while the set is in use.',
  userTypeHint: 'Changing the user type clears the matrix.',
  status: 'Status',
  createdBy: 'Created By',
} as const;

export const ACCESS_RIGHTS_VALIDATION = {
  required: 'This field is required.',
  taken: 'This Access Rights Set already exists.',
  noRights: 'Tick at least one access right.',
} as const;

export const ACCESS_RIGHTS_COLUMN_LABELS = {
  name: 'Access Rights Set',
  userType: 'User type',
  createdBy: 'Created By',
  status: 'Status',
} as const;

const USER_TYPES: UserType[] = ['admin', 'sponsor', 'co', 'site'];

export const USER_TYPE_SELECT_OPTIONS: SelectOption[] = USER_TYPES.map((t) => ({
  value: t,
  label: USER_TYPE_LABELS[t],
}));
