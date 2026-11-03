export const ACCOUNTS_LABELS = {
  listTitle: 'Sponsor and CO User Management',
  listDescription: 'Global accounts for sponsor and CRO staff. Project and site access is granted by affiliation.',
  createButton: 'Create New Sponsor or CO User',
  createTitle: 'Create New Sponsor or CO User',
  editTitle: 'Edit Sponsor or CO User',
  createDescription: 'Global account. Project / site access is granted later by affiliation.',
  globalTabLabel: 'Global access rights',
  coRightsTitle: 'Access rights',
  affiliationsLabel: 'Projects / sites',
  viewDescription: 'Account details, global access rights and affiliations.',
  identitySection: 'User details',
  globalMatrixTitle: 'Global access rights (Sponsor)',
  coNote: 'CO accounts have no global rights. Their rights are set per site when a sponsor user affiliates them.',
  affiliations: 'Affiliated to',
  noAffiliations: 'Not affiliated yet',
  submitCreate: 'Create',
  submitEdit: 'Save',
  searchPlaceholder: 'Search name, email or organization…',
} as const;

export const ACCOUNT_COLUMN_LABELS = {
  name: 'Name',
  email: 'Email ID',
  accountType: 'Account type',
  organization: 'Organization',
  status: 'User Status',
} as const;
