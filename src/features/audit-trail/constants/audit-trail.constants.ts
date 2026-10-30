export const AUDIT_TRAIL_LABELS = {
  title: 'Audit Trail',
  description:
    'Every login, create, edit, deactivate, re-activate, affiliate, deaffiliate and access-rights change. Entries are never deleted.',
  searchPlaceholder: 'Search events, values, users…',
  exportName: 'Audit trail export',
  emptyTitle: 'No audit entries',
  emptyDescription: 'Try clearing the search or filters.',
  na: 'NA',
} as const;

export const AUDIT_GROUP_LABELS = {
  when: 'When',
  where: 'Where',
  what: 'What (Track-change)',
  who: 'Who',
} as const;

export const AUDIT_COLUMN_LABELS = {
  date: 'Date',
  time: 'Time',
  timeZone: 'Reference Time-zone',
  project: 'Project',
  investigator: 'Investigator',
  participantId: 'Screening / Participant ID',
  formPage: 'Form / Page / Screen / Menu',
  event: 'Event',
  originalValue: 'Original Data',
  changedTo: 'Data Changed to',
  user: 'User Name',
} as const;

export const AUDIT_PAGE_SIZE = 20;
