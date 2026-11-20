export const SUPPORT_LABELS = {
  title: 'Sponsor and CO/CRO Contacts for Support',
  description: 'Whom the site team should contact for support on this project.',
  sponsorSection: 'Project Manager – Sponsor',
  croSection: 'CRO',
  croManagerSection: 'CO/CRO Project Manager 1',
  croAssistantSection: 'CO/CRO Assistant Project Manager',
  edit: 'Edit',
  add: 'Add contacts',
  delete: 'Delete',
  save: 'Submit',
  editTitle: 'Edit support contacts',
  addTitle: 'Add support contacts',
  emptyTitle: 'No support contacts',
  emptyDescription: 'The support card for this project has been deleted or not added yet.',
  deleteTitle: 'Delete support contacts',
  deleteMessage: 'Delete the support contact card of this project? Site users will no longer see it until it is added again.',
  deleted: 'Support contacts have been deleted.',
  added: 'Support contacts have been added.',
  saved: 'Support contacts have been saved.',
} as const;

export const SUPPORT_FIELDS = {
  name: 'Name',
  organization: 'Organization',
  email: 'Email ID (User ID)',
  phone: 'Phone Number',
  croName: 'CRO Name',
} as const;

export const SITE_CONTACT_LABELS = {
  title: 'Site Contacts',
  description: (site: string) => `Contact details of the team at site ${site}.`,
  edit: 'Edit',
  editTitle: 'Edit site contacts',
  editDescription: 'The Principal Investigator’s name, site name and email come from the site record.',
  save: 'Submit',
  saved: 'Site contacts have been saved.',
  investigatorSection: 'Principal Investigator',
  smoSection: 'Site Management Organization',
  crc1Section: 'CRC 1',
  crc2Section: 'CRC 2',
  readOnlyNote: 'Sponsor and CO users see this card read-only.',
} as const;

export const SITE_CONTACT_FIELDS = {
  investigatorName: 'Name',
  siteName: 'Site Name',
  email: 'Email ID (User ID)',
  phone: 'Phone Number',
  smoName: 'SMO Name',
  name: 'Name',
} as const;

export const CONTACT_VALIDATION = {
  required: 'This field is required.',
  emailInvalid: 'Enter a valid email ID.',
  phoneInvalid: 'Use international format, e.g. +33-4587694792.',
} as const;
