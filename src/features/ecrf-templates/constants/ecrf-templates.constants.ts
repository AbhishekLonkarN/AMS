import { PAGE_TITLES } from '@/constants/page-titles.constants';

export const ECRF_TEMPLATE_LABELS = {
  listTitle: PAGE_TITLES.ecrfTemplates,
  listDescription:
    'Reusable eCRF designs by product group, built section by section with a live preview.',
  addButton: 'Create New eCRF Template',
  createTitle: 'Create New eCRF Template',
  editTitle: 'Edit eCRF Template',
  createDescription: 'Name the template, then design its form.',
  tabDetails: 'Details',
  tabBuilder: 'Form Builder',
  detailsSection: 'Template details',
  detailsHint: 'The name must be unique. The product group decides where the template is offered.',
  detailsHintEdit:
    'Changes apply to this template only. Projects that have already loaded it keep their own copy and are not changed.',
  nameLocked: 'Cannot be changed once the template is created.',
  next: 'Next',
  save: 'Save',
  confirmSaveTitle: 'Save eCRF template?',
  confirmSave: (name: string) => `“${name}” will be saved with its current form design.`,
  confirmSaveEdit: (name: string) =>
    `Changes to “${name}” will be saved. Projects that have already loaded this template are not changed. Field keys that are already saved stay the same, so existing answers are kept.`,
  created: (name: string) => `“${name}” has been added.`,
  saved: (name: string) => `Changes to “${name}” have been saved.`,
  edit: 'Edit',
  deactivate: 'Deactivate',
  reactivate: 'Activate',
  confirmDeactivateTitle: 'Deactivate eCRF template?',
  confirmReactivateTitle: 'Activate eCRF template?',
  confirmDeactivate: (name: string) => `“${name}” will no longer be offered for new projects.`,
  confirmReactivate: (name: string) => `“${name}” will be offered for new projects again.`,
  deactivated: (name: string) => `“${name}” has been deactivated.`,
  reactivated: (name: string) => `“${name}” has been activated.`,
  unsavedBadge: 'Unsaved changes',
  unsavedTip: 'Save the template to keep these changes. A draft is kept in this browser meanwhile.',
  leaveTitle: 'Discard unsaved changes?',
  leaveMessage:
    'Your changes to this template have not been saved. If you leave now, they will be lost.',
  leaveConfirm: 'Discard',
  leaveCancel: 'Keep editing',
  recoveryTitle: (when: string) => `You have an unsaved draft from ${when}.`,
  recoveryHint:
    'Restore it to carry on where you left off, or discard it to start from the saved version.',
  restore: 'Restore draft',
  discardDraft: 'Discard',
  searchPlaceholder: 'Search template name…',
  emptyTitle: 'No eCRF templates yet',
  emptyDescription: 'Add a template to design a reusable eCRF.',
  itemLabel: 'templates',
} as const;

export const ECRF_TEMPLATE_FIELDS = {
  name: 'eCRF Template Name',
  productGroup: 'Product Group',
  description: 'Description',
  status: 'Status',
} as const;

export const ECRF_TEMPLATE_COLUMNS = {
  name: 'eCRF Template Name',
  productGroup: 'Product Group',
  sections: 'Sections',
  fields: 'Fields',
  createdBy: 'Created By',
  status: 'Status',
} as const;

export const ECRF_TEMPLATE_VALIDATION = {
  nameRequired: 'Enter a template name.',
  nameTaken: 'A template with this name already exists.',
  nameTooLong: 'Use at most 100 characters.',
  productGroupRequired: 'Choose a product group.',
  descriptionTooLong: 'Use at most 500 characters.',
} as const;

/** Names of the key-catalog layers, least specific first. */
export const CATALOG_LAYER_NAMES = {
  system: 'System default',
  template: (name: string) => `Template: ${name}`,
  own: 'This template',
} as const;
