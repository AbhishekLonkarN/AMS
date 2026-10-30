export const AFFILIATION_LABELS = {
  accountSection: 'User',
  accessSection: 'Designation and access rights',
  searchAccount: 'Search user by Email ID (User ID)',
  searchPlaceholder: 'Type an email or name…',
  noAccounts: 'No matching active account',
  alreadyAffiliated: 'Already affiliated',
  affiliatedOn: 'Affiliated on',
  affiliatedBy: 'Affiliated by',
  deaffiliatedOn: 'Deaffiliated on',
  view: 'View',
  edit: 'Edit',
  deaffiliate: 'Deaffiliate',
  confirmDeaffiliateTitle: 'Deaffiliate user?',
  confirmDeaffiliate: (name: string, where: string) =>
    `${name} will lose all access to ${where} immediately. The record is kept for the audit trail.`,
  deaffiliated: (name: string) => `${name} has been deaffiliated.`,
  affiliated: (name: string) => `${name} has been affiliated.`,
  saved: (name: string) => `Changes to ${name} have been saved.`,
  submitCreate: 'Submit',
  submitEdit: 'Save',
} as const;

export const AFFILIATION_VALIDATION = {
  accountRequired: 'Select a user account.',
  required: 'This field is required.',
} as const;
