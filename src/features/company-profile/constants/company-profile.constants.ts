export const COMPANY_PROFILE_LABELS = {
  title: 'Software and Owner Company Profile',
  description: 'Branding and owner details shown across the system.',
  edit: 'Edit',
  editTitle: 'Edit Software and Owner Company Profile',
  ownerSection: 'Owner company',
  softwareSection: 'Software system',
  adminSection: 'IT Admin of owner company',
  saved: 'Company profile has been saved.',
  save: 'Save',
  cancel: 'Cancel',
} as const;

export const COMPANY_PROFILE_FIELDS = {
  ownerDisplayName: 'Name of Owner Company to Appear',
  legalName: 'Legal Name of Owner Company',
  address: 'Address',
  itAdminUserId: 'User ID of IT Admin',
  itAdminName: 'Name of IT Admin of Owner Company',
  itAdminHint: 'Filled from the selected admin user.',
  softwareName: 'Name of this Software System',
  logo: 'Logo of this Software System',
} as const;

export const COMPANY_PROFILE_ERRORS = {
  required: 'This field is required.',
} as const;
