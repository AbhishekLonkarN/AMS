export type StatusKind = 'active' | 'inactive' | 'deaffiliated' | 'customised' | 'draft';

export const STATUS_BADGE_LABELS: Record<StatusKind, string> = {
  active: 'Active',
  inactive: 'In-active',
  deaffiliated: 'Deaffiliated',
  customised: 'Customised',
  draft: 'Draft',
};

export const FEEDBACK_LABELS = {
  dismiss: 'Dismiss notification',
  confirm: 'Confirm',
  cancel: 'Cancel',
} as const;
