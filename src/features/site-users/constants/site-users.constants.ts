export const SITE_USER_LABELS = {
  listTitle: 'Site User Management',
  listDescription: (site: string) => `Investigators, sub-investigators and CRCs of site ${site}.`,
  createButton: 'Create Site User for this Site',
  createTitle: 'Create Site User for this Site',
  editTitle: 'Edit Site User for this Site',
  viewDescription: (site: string) => `Site user of ${site} and effective site access rights.`,
  identityHint: 'Email ID must be unique in this site. An email used at another site re-uses that login.',
  roleSection: 'Designation and time-zone',
  assignmentSection: 'Site membership',
  matrixTitle: 'Site access rights (Site user)',
  detailsSection: 'Site user',
  otherSites: 'Other site memberships',
  noOtherSites: 'None',
  reuseTitle: 'Existing site login',
  reuseBody: (name: string, sites: string) =>
    `${name} already logs in as a site user at ${sites}. This site will be added to the same login; name changes apply to all of their sites.`,
  submitCreate: 'Submit',
  submitEdit: 'Save',
  created: (name: string) => `${name} has been added to this site.`,
  saved: (name: string) => `Changes to ${name} have been saved.`,
  exportName: 'Site users export',
  searchPlaceholder: 'Search name, email, designation…',
} as const;

export const SITE_USER_VALIDATION = {
  required: 'This field is required.',
  emailInvalid: 'Enter a valid email ID.',
  nameTakenInSite: 'This Name already exists in this site.',
  emailTakenInSite: 'This Email ID already exists in this site.',
  emailNotSiteAccount: 'This email ID belongs to an admin, sponsor or CO account and cannot be used for a site user.',
  emailTaken: 'This email ID is already used by another user.',
} as const;
