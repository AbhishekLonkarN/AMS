export const SITE_DASHBOARD_LABELS = {
  title: 'Site Dashboard',
  enrolmentStatus: { title: 'Enrolment status', expected: 'Expected', actual: 'Actual' },
  enrolment: { title: 'Enrolment', subtitle: 'Participants enrolled, by days since first screening', empty: 'No participants enrolled yet.' },
  queries: { title: 'Data queries', total: 'Total queries', attended: 'Queries attended', resolved: 'Queries resolved' },
  banner: { investigator: 'Investigator', site: 'Site', status: 'Site status', recruitment: 'Recruitment' },
  /** One point per week on the enrolment line. */
  weekDays: 7,
  /** Participant statuses that count as enrolled (everything after Screen Pass). */
  notEnrolledStatusIds: ['ms-pt-screen-failed', 'ms-pt-screen-pass'],
} as const;
