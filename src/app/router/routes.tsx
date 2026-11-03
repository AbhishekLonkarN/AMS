import type { ReactNode } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import type { PermissionKey } from '@/types';
import { RequirePermission } from '@/rbac';
import { PAGE_TITLES } from '@/constants/page-titles.constants';
import { ContextPickerPage, HomeRedirectPage, LoginPage } from '@/features/auth';
import {
  ForbiddenPage,
  HubPage,
  MASTER_VIEW_PERMISSIONS,
  NotFoundPage,
  PlaceholderPage,
  ShellLayoutPage,
} from '@/features/shell';
import { UiKitPage } from '@/features/ui-kit';
import { AdminDashboardPage } from '@/features/admin-dashboard';
import { UsersListPage } from '@/features/admin-users';
import { CompanyProfilePage } from '@/features/company-profile';
import { TemplateListPage } from '@/features/access-rights-templates';
import { MasterListPage } from '@/features/masters';
import { ProjectHubPage, ProjectListPage } from '@/features/projects';
import { SiteHubPage, SiteListPage } from '@/features/sites';
import { SponsorUserListPage } from '@/features/project-sponsor-users';
import { CoUserListPage } from '@/features/site-co-users';
import { SiteUserListPage } from '@/features/site-users';
import { AuditTrailPage } from '@/features/audit-trail';
import { AssumptionsPage } from '@/features/assumptions';
import { RequireAuth, RequireMasterKey, RequireProjectAccess, RequireSiteAccess, RequireUserType } from './guards';
import { ROUTES } from './route-paths.constants';
import { RouteErrorPage } from './RouteErrorPage';

// ---- helpers -------------------------------------------------------------

const guard = (permission: PermissionKey | PermissionKey[], element: ReactNode) => (
  <RequirePermission permission={permission}>{element}</RequirePermission>
);

/** Phase-2 module placeholder. */
const phase2 = (title: string) => <PlaceholderPage title={title} />;

const page = (
  path: string,
  permission: PermissionKey | PermissionKey[] | null,
  element: ReactNode,
  children?: RouteObject[],
): RouteObject => ({
  path,
  element: permission ? guard(permission, element) : element,
  children,
});

/** A child route that only enforces a permission; the parent page renders the content (a drawer). */
const guardOnly = (path: string, permission: PermissionKey): RouteObject => ({
  path,
  element: <RequirePermission permission={permission}>{null}</RequirePermission>,
  // An overlay over the parent page, not a page of its own (no page-change animation).
  handle: { isOverlay: true },
});

// ---- route tree ----------------------------------------------------------

const adminRoutes: RouteObject[] = [
  { path: ROUTES.adminHome, element: <RequireUserType types={['admin']}><AdminDashboardPage /></RequireUserType> },
  page(ROUTES.companyProfile, 'companyProfile.view', <CompanyProfilePage />),
  // One "Users" tab in the sidebar: a single list of Admin, Sponsor and CO users. Create / view / edit open
  // in a drawer over it; those child routes only enforce their permission.
  page(ROUTES.users, ['adminUser.view', 'sponsorCoUser.view'], <UsersListPage />, [
    guardOnly(ROUTES.adminUserNew, 'adminUser.new'),
    guardOnly(ROUTES.adminUserView, 'adminUser.view'),
    guardOnly(ROUTES.adminUserEdit, 'adminUser.edit'),
    guardOnly(ROUTES.accountNew, 'sponsorCoUser.new'),
    guardOnly(ROUTES.accountView, 'sponsorCoUser.view'),
    guardOnly(ROUTES.accountEdit, 'sponsorCoUser.edit'),
    // The former separate lists now live in the Users list.
    { path: ROUTES.adminUsers, element: <Navigate to={ROUTES.users} replace /> },
    { path: ROUTES.accounts, element: <Navigate to={ROUTES.users} replace /> },
  ]),
  page(ROUTES.projectExport, 'projectDatabase.export', phase2(PAGE_TITLES.projectExport)),
  // Not in the Admin sidebar for now (routes kept; add a tab or move them inside one later).
  page(ROUTES.cloudSettings, 'cloudSettings.view', phase2(PAGE_TITLES.cloudSettings)),
  page(ROUTES.backup, 'cloudSettings.view', phase2(PAGE_TITLES.backup)),
];

const sponsorRoutes: RouteObject[] = [
  { path: ROUTES.home, element: <RequireUserType types={['sponsor']}><HubPage hub="sponsor" /></RequireUserType> },
  {
    path: ROUTES.personalDashboard,
    element: <RequireUserType types={['sponsor']}>{phase2(PAGE_TITLES.personalDashboard)}</RequireUserType>,
  },
  page(ROUTES.masters, MASTER_VIEW_PERMISSIONS, <HubPage hub="masters" />),
  page(ROUTES.accessRights, 'masterDefaultAccessRights.view', <TemplateListPage />, [
    guardOnly(ROUTES.accessRightsNew, 'masterDefaultAccessRights.new'),
    guardOnly(ROUTES.accessRightsView, 'masterDefaultAccessRights.view'),
    guardOnly(ROUTES.accessRightsEdit, 'masterDefaultAccessRights.edit'),
  ]),
  { path: ROUTES.master, element: <RequireMasterKey><MasterListPage /></RequireMasterKey> },
  page(ROUTES.ecrfTemplates, 'ecrfTemplate.view', phase2(PAGE_TITLES.ecrfTemplates)),
  page(ROUTES.projects, 'project.view', <ProjectListPage />, [
    guardOnly(ROUTES.projectNew, 'project.new'),
    guardOnly(ROUTES.projectListEdit, 'project.edit'),
  ]),
];

const siteRoutes: RouteObject = {
  path: ROUTES.siteHub,
  element: <RequireSiteAccess />,
  children: [
    // The hub stays rendered under its "Edit site" drawer.
    { element: <SiteHubPage />, children: [{ index: true, element: null }, guardOnly(ROUTES.siteEdit, 'investigatorSite.edit')] },
    page(ROUTES.siteDashboard, null, phase2(PAGE_TITLES.siteDashboard)),
    page(ROUTES.siteEcrfs, 'siteEcrfs.view', phase2(PAGE_TITLES.siteEcrfs)),
    page(ROUTES.siteQueries, 'siteEcrfQuery.view', phase2(PAGE_TITLES.siteQueries)),
    page(ROUTES.siteCoUsers, 'coUserManagement.view', <CoUserListPage />, [
      guardOnly(ROUTES.siteCoUserAffiliate, 'coUserManagement.affiliate'),
      guardOnly(ROUTES.siteCoUserView, 'coUserManagement.view'),
      guardOnly(ROUTES.siteCoUserEdit, 'coUserManagement.edit'),
    ]),
    page(ROUTES.siteUsers, 'siteUserManagement.view', <SiteUserListPage />, [
      guardOnly(ROUTES.siteUserNew, 'siteUserManagement.new'),
      guardOnly(ROUTES.siteUserView, 'siteUserManagement.view'),
      guardOnly(ROUTES.siteUserEdit, 'siteUserManagement.edit'),
    ]),
    page(ROUTES.siteEtmf, 'etmfSite.view', phase2(PAGE_TITLES.siteEtmf)),
    page(ROUTES.siteEtmfProject, 'etmfProject.view', phase2(PAGE_TITLES.projectEtmf)),
    page(ROUTES.siteSupportContacts, 'supportContacts.view', phase2(PAGE_TITLES.supportContacts)),
    page(ROUTES.siteContacts, 'siteContacts.view', phase2(PAGE_TITLES.siteContacts)),
  ],
};

const projectRoutes: RouteObject = {
  path: ROUTES.projectHub,
  element: <RequireProjectAccess />,
  children: [
    // The hub stays rendered under its "Edit project" drawer.
    {
      element: <RequireUserType types={['sponsor']}><ProjectHubPage /></RequireUserType>,
      children: [{ index: true, element: null }, guardOnly(ROUTES.projectEdit, 'project.edit')],
    },
    {
      path: ROUTES.projectDashboard,
      element: <RequireUserType types={['sponsor']}>{phase2(PAGE_TITLES.projectDashboard)}</RequireUserType>,
    },
    page(ROUTES.projectEcrf, 'projectEcrf.view', phase2(PAGE_TITLES.projectEcrf)),
    page(ROUTES.projectSponsorUsers, 'sponsorUserManagement.view', <SponsorUserListPage />, [
      guardOnly(ROUTES.projectSponsorUserAffiliate, 'sponsorUserManagement.affiliate'),
      guardOnly(ROUTES.projectSponsorUserView, 'sponsorUserManagement.view'),
      guardOnly(ROUTES.projectSponsorUserEdit, 'sponsorUserManagement.edit'),
    ]),
    page(ROUTES.projectSites, 'investigatorSite.view', <SiteListPage />, [
      guardOnly(ROUTES.projectSiteNew, 'investigatorSite.new'),
      guardOnly(ROUTES.projectSiteListEdit, 'investigatorSite.edit'),
    ]),
    page(ROUTES.projectQueries, 'projectQueriesAll.export', phase2(PAGE_TITLES.projectQueries)),
    page(ROUTES.projectEtmf, 'etmfProject.view', phase2(PAGE_TITLES.projectEtmf)),
    page(ROUTES.projectDatabaseLock, 'projectDatabase.lock', phase2(PAGE_TITLES.projectDatabaseLock)),
    page(ROUTES.projectSelectiveExport, 'selectiveParticipantData.export', phase2(PAGE_TITLES.selectiveExport)),
    page(ROUTES.projectDatabaseExport, 'projectDatabase.export', phase2(PAGE_TITLES.databaseExport)),
    page(ROUTES.projectSupportContacts, 'supportContacts.view', phase2(PAGE_TITLES.supportContacts)),
    page(ROUTES.projectSettings, 'settings.view', phase2(PAGE_TITLES.projectSettings)),
    siteRoutes,
  ],
};

const routes: RouteObject[] = [
  { path: ROUTES.login, element: <LoginPage />, errorElement: <RouteErrorPage /> },
  {
    element: <RequireAuth />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <ShellLayoutPage />,
        children: [
          { path: ROUTES.root, element: <HomeRedirectPage /> },
          { path: ROUTES.forbidden, element: <ForbiddenPage /> },
          { path: ROUTES.assumptions, element: <AssumptionsPage /> },
          { path: ROUTES.selectContext, element: <ContextPickerPage /> },
          { path: ROUTES.uiKit, element: <UiKitPage /> },
          page(ROUTES.auditTrail, 'auditTrail.view', <AuditTrailPage />),
          page(ROUTES.databaseExport, 'projectDatabase.export', phase2(PAGE_TITLES.databaseExport)),
          ...adminRoutes,
          ...sponsorRoutes,
          projectRoutes,
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes, {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
});
