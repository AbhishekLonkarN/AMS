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
  confirmSave: (name: string) =>
    `“${name}” will be saved as a draft. Publish it from the list to make it available to projects.`,
  confirmSaveEdit: (name: string) =>
    `Changes to “${name}” will be saved as a draft. Projects that have already loaded this template are not changed. Field keys that are already saved stay the same, so existing answers are kept.`,
  created: (name: string) => `“${name}” has been added as a draft.`,
  saved: (name: string) => `Changes to “${name}” have been saved.`,
  statusFailed: (name: string) => `“${name}” was saved, but its status could not be changed.`,
  edit: 'Edit',
  publish: 'Publish',
  delete: 'Delete',
  deactivate: 'Deactivate',
  reactivate: 'Activate',
  confirmPublishTitle: 'Publish eCRF template?',
  confirmPublish: (name: string) =>
    `The saved draft of “${name}” becomes the version projects can load. Projects that have already loaded this template keep their copy.`,
  published: (name: string, version: number) => `“${name}” version ${version} has been published.`,
  confirmDeleteTitle: 'Delete eCRF template?',
  confirmDelete: (name: string) =>
    `“${name}” will be deleted. A template that a project has already loaded cannot be deleted.`,
  deleted: (name: string) => `“${name}” has been deleted.`,
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
  loading: 'Loading eCRF templates…',
  loadFailed: 'eCRF templates could not be loaded.',
  loadingTemplate: 'Loading the template…',
  loadTemplateFailed: 'The template could not be loaded.',
  retry: 'Try again',
  saveFailed: 'The template could not be saved.',
  designConflict:
    'Someone else saved this template while you were editing. Close it and open it again to see their changes.',
  moreIssues: (n: number) => ` (and ${n} more problem${n === 1 ? '' : 's'})`,
  itemLabel: 'templates',
  versionUnpublished: 'Draft (not published)',
  versionPublished: (n: number) => `v${n}`,
  versionWithDraft: (n: number) => `v${n} + unpublished changes`,
} as const;

export const ECRF_TEMPLATE_FIELDS = {
  name: 'eCRF Template Name',
  productGroup: 'Product Group',
  suitableFor: 'Suitable For',
  status: 'Status',
} as const;

export const ECRF_TEMPLATE_COLUMNS = {
  name: 'eCRF Template Name',
  productGroup: 'Product Group',
  suitableFor: 'Suitable For',
  version: 'Version',
  createdBy: 'Created By',
  status: 'Status',
} as const;

export const ECRF_TEMPLATE_VALIDATION = {
  nameRequired: 'Enter a template name.',
  nameTaken: 'A template with this name already exists.',
  nameTooLong: 'Use at most 100 characters.',
  productGroupRequired: 'Choose a product group.',
  suitableForRequired: 'Describe what the template is suitable for.',
  suitableForTooLong: 'Use at most 500 characters.',
} as const;

/** Names of the key-catalog layers, least specific first. */
export const CATALOG_LAYER_NAMES = {
  system: 'System default',
  own: 'This template',
} as const;
