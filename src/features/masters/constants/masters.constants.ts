export const MASTER_LABELS = {
  addButton: 'Add Master',
  addTitle: (itemName: string) => `Add Master-${itemName}`,
  editTitle: (itemName: string) => `Edit Master-${itemName}`,
  add: 'Add',
  save: 'Save',
  description: 'Description',
  status: 'Status',
  edit: 'Edit',
  deactivate: 'Deactivate',
  reactivate: 'Activate',
  confirmDeactivateTitle: (itemName: string) => `Deactivate ${itemName}?`,
  confirmReactivateTitle: (itemName: string) => `Activate ${itemName}?`,
  confirmDeactivate: (label: string) =>
    `“${label}” will be hidden from dropdowns for new and edited records. Records that already use it keep it.`,
  confirmReactivate: (label: string) => `“${label}” will be available in dropdowns again.`,
  added: (label: string) => `“${label}” has been added.`,
  saved: (label: string) => `Changes to “${label}” have been saved.`,
  deactivated: (label: string) => `“${label}” has been deactivated.`,
  reactivated: (label: string) => `“${label}” has been activated.`,
  searchPlaceholder: 'Search…',
  inactiveSuffix: '(In-active)',
  loading: 'Loading…',
  loadFailed: 'The values could not be loaded.',
  saveFailed: 'The changes could not be saved.',
} as const;

export const MASTER_VALIDATION = {
  required: 'This field is required.',
  taken: (itemName: string) => `This ${itemName} already exists.`,
  tooLong: (max: number) => `Use at most ${max} characters.`,
} as const;
