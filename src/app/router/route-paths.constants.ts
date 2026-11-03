import { generatePath } from 'react-router-dom';
import type { MasterKey } from '@/types';

/** Route patterns. Components never build URLs by hand: use `paths.*`. */
export const ROUTES = {
  root: '/',
  login: '/login',
  selectContext: '/select-context',
  forbidden: '/403',
  assumptions: '/assumptions',
  uiKit: '/ui-kit',
  auditTrail: '/audit-trail',
  databaseExport: '/database-export',

  // Admin portal
  adminHome: '/admin',
  companyProfile: '/admin/company-profile',
  // Users tab: one entry in the sidebar, two lists inside it
  users: '/admin/users',
  adminUsers: '/admin/users/admin-users',
  adminUserNew: '/admin/users/admin-users/new',
  adminUserView: '/admin/users/admin-users/:userId',
  adminUserEdit: '/admin/users/admin-users/:userId/edit',
  accounts: '/admin/users/sponsor-and-co',
  accountNew: '/admin/users/sponsor-and-co/new',
  accountView: '/admin/users/sponsor-and-co/:userId',
  accountEdit: '/admin/users/sponsor-and-co/:userId/edit',
  projectExport: '/admin/project-export',
  cloudSettings: '/admin/cloud-settings',
  backup: '/admin/backup',

  // Sponsor portal (global)
  home: '/home',
  personalDashboard: '/dashboard',
  masters: '/masters',
  accessRights: '/masters/access-rights',
  accessRightsNew: '/masters/access-rights/new',
  accessRightsView: '/masters/access-rights/:templateId',
  accessRightsEdit: '/masters/access-rights/:templateId/edit',
  master: '/masters/:masterKey',
  ecrfTemplates: '/ecrf-templates',
  projects: '/projects',
  projectNew: '/projects/new',
  projectListEdit: '/projects/edit/:projectId',

  // Project hub
  projectHub: '/projects/:projectId',
  projectEdit: '/projects/:projectId/edit',
  projectDashboard: '/projects/:projectId/dashboard',
  projectEcrf: '/projects/:projectId/ecrf',
  projectSponsorUsers: '/projects/:projectId/sponsor-users',
  projectSponsorUserAffiliate: '/projects/:projectId/sponsor-users/affiliate',
  projectSponsorUserView: '/projects/:projectId/sponsor-users/:affiliationId',
  projectSponsorUserEdit: '/projects/:projectId/sponsor-users/:affiliationId/edit',
  projectSites: '/projects/:projectId/sites',
  projectSiteNew: '/projects/:projectId/sites/new',
  projectSiteListEdit: '/projects/:projectId/sites/edit/:siteId',
  projectQueries: '/projects/:projectId/queries',
  projectEtmf: '/projects/:projectId/etmf',
  projectDatabaseLock: '/projects/:projectId/database-lock',
  projectSelectiveExport: '/projects/:projectId/selective-export',
  projectDatabaseExport: '/projects/:projectId/database-export',
  projectSupportContacts: '/projects/:projectId/support-contacts',
  projectSettings: '/projects/:projectId/settings',

  // Site hub
  siteHub: '/projects/:projectId/sites/:siteId',
  siteEdit: '/projects/:projectId/sites/:siteId/edit',
  siteDashboard: '/projects/:projectId/sites/:siteId/dashboard',
  siteEcrfs: '/projects/:projectId/sites/:siteId/ecrfs',
  siteQueries: '/projects/:projectId/sites/:siteId/queries',
  siteCoUsers: '/projects/:projectId/sites/:siteId/co-users',
  siteCoUserAffiliate: '/projects/:projectId/sites/:siteId/co-users/affiliate',
  siteCoUserView: '/projects/:projectId/sites/:siteId/co-users/:affiliationId',
  siteCoUserEdit: '/projects/:projectId/sites/:siteId/co-users/:affiliationId/edit',
  siteUsers: '/projects/:projectId/sites/:siteId/site-users',
  siteUserNew: '/projects/:projectId/sites/:siteId/site-users/new',
  siteUserView: '/projects/:projectId/sites/:siteId/site-users/:membershipId',
  siteUserEdit: '/projects/:projectId/sites/:siteId/site-users/:membershipId/edit',
  siteEtmf: '/projects/:projectId/sites/:siteId/etmf',
  siteEtmfProject: '/projects/:projectId/sites/:siteId/etmf-project',
  siteSupportContacts: '/projects/:projectId/sites/:siteId/support-contacts',
  siteContacts: '/projects/:projectId/sites/:siteId/contacts',
} as const;

type P = { projectId: string };
type S = P & { siteId: string };

const project = (pattern: string) => (projectId: string) => generatePath(pattern, { projectId });
const site = (pattern: string) => (projectId: string, siteId: string) => generatePath(pattern, { projectId, siteId });

export const paths = {
  adminUserView: (userId: string) => generatePath(ROUTES.adminUserView, { userId }),
  adminUserEdit: (userId: string) => generatePath(ROUTES.adminUserEdit, { userId }),
  accountView: (userId: string) => generatePath(ROUTES.accountView, { userId }),
  accountEdit: (userId: string) => generatePath(ROUTES.accountEdit, { userId }),
  accessRightsView: (templateId: string) => generatePath(ROUTES.accessRightsView, { templateId }),
  accessRightsEdit: (templateId: string) => generatePath(ROUTES.accessRightsEdit, { templateId }),
  master: (masterKey: MasterKey) => generatePath(ROUTES.master, { masterKey }),

  projectListEdit: project(ROUTES.projectListEdit),
  projectHub: project(ROUTES.projectHub),
  projectEdit: project(ROUTES.projectEdit),
  projectDashboard: project(ROUTES.projectDashboard),
  projectEcrf: project(ROUTES.projectEcrf),
  projectSponsorUsers: project(ROUTES.projectSponsorUsers),
  projectSponsorUserAffiliate: project(ROUTES.projectSponsorUserAffiliate),
  projectSponsorUserView: (projectId: string, affiliationId: string) =>
    generatePath(ROUTES.projectSponsorUserView, { projectId, affiliationId }),
  projectSponsorUserEdit: (projectId: string, affiliationId: string) =>
    generatePath(ROUTES.projectSponsorUserEdit, { projectId, affiliationId }),
  projectSites: project(ROUTES.projectSites),
  projectSiteNew: project(ROUTES.projectSiteNew),
  projectSiteListEdit: site(ROUTES.projectSiteListEdit),
  projectQueries: project(ROUTES.projectQueries),
  projectEtmf: project(ROUTES.projectEtmf),
  projectDatabaseLock: project(ROUTES.projectDatabaseLock),
  projectSelectiveExport: project(ROUTES.projectSelectiveExport),
  projectDatabaseExport: project(ROUTES.projectDatabaseExport),
  projectSupportContacts: project(ROUTES.projectSupportContacts),
  projectSettings: project(ROUTES.projectSettings),

  siteHub: site(ROUTES.siteHub),
  siteEdit: site(ROUTES.siteEdit),
  siteDashboard: site(ROUTES.siteDashboard),
  siteEcrfs: site(ROUTES.siteEcrfs),
  siteQueries: site(ROUTES.siteQueries),
  siteCoUsers: site(ROUTES.siteCoUsers),
  siteCoUserAffiliate: site(ROUTES.siteCoUserAffiliate),
  siteCoUserView: (projectId: string, siteId: string, affiliationId: string) =>
    generatePath(ROUTES.siteCoUserView, { projectId, siteId, affiliationId }),
  siteCoUserEdit: (projectId: string, siteId: string, affiliationId: string) =>
    generatePath(ROUTES.siteCoUserEdit, { projectId, siteId, affiliationId }),
  siteUsers: site(ROUTES.siteUsers),
  siteUserNew: site(ROUTES.siteUserNew),
  siteUserView: (projectId: string, siteId: string, membershipId: string) =>
    generatePath(ROUTES.siteUserView, { projectId, siteId, membershipId }),
  siteUserEdit: (projectId: string, siteId: string, membershipId: string) =>
    generatePath(ROUTES.siteUserEdit, { projectId, siteId, membershipId }),
  siteEtmf: site(ROUTES.siteEtmf),
  siteEtmfProject: site(ROUTES.siteEtmfProject),
  siteSupportContacts: site(ROUTES.siteSupportContacts),
  siteContacts: site(ROUTES.siteContacts),
};

export type ProjectRouteParams = P;
export type SiteRouteParams = S;
