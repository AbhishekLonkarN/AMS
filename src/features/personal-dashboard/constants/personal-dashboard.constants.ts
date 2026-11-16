export const PERSONAL_DASHBOARD_LABELS = {
  title: 'Dashboard',
  description: 'Your projects, sites and recent activity at a glance.',
  kpis: {
    projects: 'My projects',
    ongoing: 'Ongoing projects',
    sites: 'Sites',
    enrolled: 'Participants enrolled',
    target: 'Enrolment target',
    actions: 'My actions (7 days)',
  },
  projectsByStatus: { title: 'My projects by status', empty: 'You are not affiliated to any project.' },
  sitesByStatus: { title: 'Sites by status', total: 'Sites' },
  enrolment: { title: 'Enrolment by project', empty: 'No enrolment yet.' },
  activity: { title: 'My day wise activity', subtitle: 'Last 30 days', empty: 'No activity recorded yet.' },
} as const;

/** Master label that marks a project as running. */
export const ONGOING_STATUS_LABEL = 'Ongoing';

/** Donut colours for the site-status split (design tokens). */
export const SITE_STATUS_COLORS = [
  'var(--color-brand-700)',
  'var(--color-accent-500)',
  'var(--color-sage-300)',
  'var(--color-status-warning)',
  'var(--color-brand-500)',
  'var(--color-sage-700)',
];
