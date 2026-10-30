export const DRAWER_LABELS = {
  tabDetails: 'User details',
  tabOverview: 'Overview',
  tabAccess: 'Access rights',
  userDetails: 'User details',
  userDetailsHint: 'Identity and login. The Email ID is the User ID.',
  record: 'Record',
  template: 'Default access rights set',
  templateHint: 'Optional. Picking a set prefills the matrix; you can still tick or untick boxes.',
  templateRequiredHint: 'Prefills the matrix; you can still tick or untick boxes.',
  accessRights: 'Access rights',
  effectiveRights: 'Effective access rights',
  close: 'Close',
  edit: 'Edit',
} as const;

/** Form fields shown on the "details" tab; used to switch tabs when validation fails there. */
export const DETAILS_TAB_FIELDS = ['prefix', 'name', 'email', 'organization', 'status', 'accountType'] as const;
