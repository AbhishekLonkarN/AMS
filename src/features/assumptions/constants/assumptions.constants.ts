export interface AssumptionSection {
  id: string;
  title: string;
  description?: string;
  items: { title: string; body: string }[];
}

export const ASSUMPTIONS_LABELS = {
  title: 'Prototype Assumptions',
  description:
    'Decisions taken where the AMS drafts leave things open. Please review; anything here can change before the real build.',
  demoTitle: 'Demo users',
  demoDescription: 'Use the switcher in the user menu (top right) to change role without logging out. Any password works.',
  demoColumns: { role: 'Role', user: 'User', tryThis: 'Try this' },
  phase2Title: 'Coming in Phase 2',
  phase2Description: 'These modules have pages and access control already; their content is not built yet.',
} as const;

export const ASSUMPTION_SECTIONS: AssumptionSection[] = [
  {
    id: 'decided',
    title: 'Decided assumptions (brief §4.4)',
    items: [
      {
        title: 'Account type',
        body: 'Sponsor and CO accounts carry an Account type (Sponsor / CO) chosen by the Admin when creating the account.',
      },
      {
        title: 'Global sponsor rights',
        body: 'Sponsor modules 1–7 (Masters, eCRF Templates, Project) and the global Audit Trail are global, set on the account by the Admin. Modules 8–23 are per project, set at affiliation.',
      },
      {
        title: 'Typed templates',
        body: 'Each Default Access Rights set has a user type (Admin, Sponsor, CO, Site) and uses that matrix shape.',
      },
      {
        title: 'Templates prefill',
        body: 'Choosing a set prefills the matrix; boxes can then be ticked or unticked. The record keeps the set and shows "Customised" when it differs.',
      },
      {
        title: 'Site user identity',
        body: 'A site user email is unique within a site. The same email at another site is the same login with several site memberships; such users pick a project/site after login.',
      },
      { title: 'No hard deletes', body: 'Users are Deactivated; affiliations are Deaffiliated (end-dated). Nothing is deleted.' },
      {
        title: 'Master "Delete" = Deactivate',
        body: 'The matrix "Delete" right gates Deactivate / Re-activate on masters. Product Group has no Delete column, so its Edit right is used.',
      },
      {
        title: 'Deactivated master values',
        body: 'They stay on existing records but are hidden from dropdowns for new or edited records (an existing value shows as "(In-active)"). Lists show them with an In-active badge.',
      },
    ],
  },
  {
    id: 'access',
    title: 'Access and navigation',
    items: [
      { title: 'Back-up', body: 'Not in the Admin matrix; shown to admins with Cloud Settings › View.' },
      {
        title: 'Queries on eCRFs of Project',
        body: 'The matrix only has Export for this module, so Export is what makes the page visible.',
      },
      {
        title: 'CO and site users',
        body: 'They work inside their site hub only. Project eTMF documents and support contacts appear in their site menu (as in the Site User draft).',
      },
      {
        title: 'Deaffiliate / Deactivate rights',
        body: 'Deaffiliate (Sponsor and CO users) is gated by the Affiliate right; Deactivate of site users by Edit, as these modules have no Delete column.',
      },
      { title: 'Own account', body: 'Nobody can deactivate or deaffiliate themselves.' },
      {
        title: 'Immediate effect',
        body: 'Deactivating a user or ending an affiliation removes access at once, including for a user who is signed in.',
      },
    ],
  },
  {
    id: 'users',
    title: 'Users, affiliations and templates',
    items: [
      {
        title: 'Template optional vs mandatory',
        body: 'Optional on Admin users and Sponsor global rights (the Admin draft has none); mandatory on affiliation and site-user forms (marked * in the drafts).',
      },
      { title: 'Account type locked', body: 'It cannot change while the account has active affiliations.' },
      {
        title: 'Access-rights sets',
        body: 'A set must grant at least one right. Its user type cannot change while the set is in use.',
      },
      {
        title: 'One site login',
        body: "A site user's name and email belong to their single login; changing them at one site changes them everywhere. Changing an email to another existing login's email is blocked.",
      },
      {
        title: 'Affiliation history',
        body: 'Deaffiliated records stay in the lists (greyed out, view only). Re-affiliating creates a new record.',
      },
      {
        title: 'Project creator',
        body: 'Whoever creates a project is affiliated to it automatically (designation and project rights from their global access-rights set), so it appears in their project list.',
      },
    ],
  },
  {
    id: 'data',
    title: 'Data and display',
    items: [
      {
        title: 'Audit time-zone',
        body: "Entries record the browser's time zone at the time of the action and are displayed in that zone. Sponsors with Audit Trail rights see the full global trail.",
      },
      { title: 'List order', body: 'Lists show the newest record first, as in the drafts.' },
      { title: 'Status wording', body: 'The app uses "Active / In-active" everywhere, including masters (the drafts also use "Deactivated").' },
      {
        title: 'Recruitment figures',
        body: 'Actual recruitment and project enrolment come from seed data until participants exist (Phase 2).',
      },
      { title: 'Uploads', body: 'Logo uploads keep the file name only; the Company Profile logo is therefore optional.' },
      {
        title: 'Seed data',
        body: 'Duplicate placeholder emails in the drafts were replaced with unique ones. Two ABCD sites were added so a CRC has two memberships.',
      },
      {
        title: 'Prototype storage',
        body: 'Data lives in the browser and resets on reload (a flag in store.config.ts keeps it in localStorage). Your sign-in survives reloads.',
      },
    ],
  },
];

export const DEMO_GUIDE: Record<string, string> = {
  'usr-abcd': 'Create admin users and sponsor/CO accounts; edit the company profile; read the audit trail.',
  'usr-jpatel': 'Everything: masters, projects, sites, affiliate sponsor/CO users, create site users.',
  'usr-kbhatt': 'Run projects and sites; masters are view-only.',
  'usr-akulkarni': 'View and export only: notice the missing Add / Edit buttons.',
  'usr-amartin': 'CRA at FR-006 only: monitor the site, create site users.',
  'usr-pchevalier': 'Investigator at FR-006: the site-user view of the app.',
  'usr-dyna': 'CRC at two sites: picks a project/site after login.',
};

export const PHASE2_MODULES = [
  "User's Personal Dashboard",
  'eCRF Templates (form builder)',
  'eCRF of Project',
  'Project and Site Dashboards',
  'eCRFs of Site (data entry, Draft Save / Submit)',
  'Queries on eCRFs (site and project)',
  'eTMF Documents (project and site)',
  'Project Database Lock / Unlock and Export',
  'Selective Data Export',
  'Support and Site Contacts',
  'Project Settings, Cloud Settings, Back-up',
  'Excel / PDF exports',
  'Biometric login',
] as const;
