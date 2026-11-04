import type { NavSectionKey } from './navigation.constants';

export const SECTION_TITLES: Record<NavSectionKey, string | undefined> = {
  admin: undefined, // the Admin sidebar has no section heading
  sponsor: 'Sponsor portal',
  mySites: undefined,
  project: 'Project',
  site: 'Site',
};

/** The product shown in the Admin sidebar, with the logo from the login page. */
export const PLATFORM_BRAND_NAME = 'ClinTech';

export const SHELL_LABELS = {
  defaultRole: {
    admin: 'AMS IT Admin',
    sponsor: 'Sponsor',
    co: 'CO / CRO',
    site: 'Site user',
  },
  noTiles: 'You do not have access to any modules here yet.',
} as const;

export const HUB_TITLES = {
  admin: 'Dashboard',
  sponsor: 'Home',
  masters: 'Masters',
} as const;

export const HUB_DESCRIPTIONS = {
  admin: 'Company profile, users, project export and audit trail.',
  sponsor: 'Masters, templates and the projects you are affiliated to.',
  masters: 'Reference lists used in dropdowns across ClinTech.',
} as const;

export const PLACEHOLDER_LABELS = {
  badge: 'Phase 2',
  title: 'Coming in Phase 2',
  body: 'This module is part of the next phase. Navigation and access control are already in place.',
} as const;

export const ERROR_PAGE_LABELS = {
  forbiddenCode: '403',
  forbiddenTitle: 'No access',
  forbiddenBody: 'Your access rights do not include this page or action. Ask your administrator if you need it.',
  notFoundCode: '404',
  notFoundTitle: 'Page not found',
  notFoundBody: 'The page you are looking for does not exist or has moved.',
  goHome: 'Go to home',
} as const;
