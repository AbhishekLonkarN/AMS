export const SITE_LABELS = {
  listTitle: 'Investigator and Site',
  listDescription: 'Investigators and sites participating in this project.',
  addButton: 'Add New Investigator and Site',
  createTitle: 'Add New Investigator and Site in this Project',
  editTitle: 'Edit Investigator and Site in this Project',
  submitCreate: 'Submit',
  submitEdit: 'Save',
  open: 'Open site',
  edit: 'Edit',
  created: (code: string) => `Site ${code} has been added.`,
  saved: (code: string) => `Changes to site ${code} have been saved.`,
  searchPlaceholder: 'Search investigator, site, location…',
  emptyTitle: 'No sites yet',
  emptyDescription: 'Add the first investigator and site for this project.',
  createDescription: 'A principal investigator and the site they run.',
  sectionInvestigator: 'Investigator',
  sectionInvestigatorHint: 'Investigator + Email ID must be unique within this project.',
  sectionSite: 'Site',
  // Hub
  hubEdit: 'Edit site',
  recruitment: 'Recruitment',
  recruitmentValue: (actual: number, expected: number) => `${actual} of ${expected} expected`,
  modulesTitle: 'Modules',
} as const;

export const SITE_FIELDS = {
  investigatorName: 'Investigator',
  investigatorEmail: 'Email ID',
  siteCode: 'Site ID',
  siteName: 'Site Name',
  location: 'Location',
  address: 'Complete Address for Correspondence',
  expectedRecruitment: 'Expected Recruitment',
  actualRecruitment: 'Actual Recruitment',
  statusId: 'Site Status',
  siteCodeHint: 'Unique within this project, e.g. FR-006.',
} as const;

export const SITE_VALIDATION = {
  required: 'This field is required.',
  emailInvalid: 'Enter a valid email ID.',
  positiveNumber: 'Enter a whole number greater than 0.',
  siteCodeTaken: 'This Site ID already exists in this project.',
  investigatorTaken: 'This Investigator and Email ID combination already exists in this project.',
} as const;
