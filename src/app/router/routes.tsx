import type { ReactNode } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
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
import { AdminUserListPage } from '@/features/admin-users';
import { AccountListPage } from '@/features/sponsor-co-accounts';
import { CompanyProfilePage } from '@/features/company-profile';
import { TemplateFormPage, TemplateListPage, TemplateViewPage } from '@/features/access-rights-templates';
import { MasterListPage } from '@/features/masters';
import { ProjectFormPage, ProjectHubPage, ProjectListPage } from '@/features/projects';
import { SiteFormPage, SiteHubPage, SiteListPage } from '@/features/sites';
import { SponsorUserFormPage, SponsorUserListPage, SponsorUserViewPage } from '@/features/project-sponsor-users';
import { CoUserFormPage, CoUserListPage, CoUserViewPage } from '@/features/site-co-users';
import { SiteUserFormPage, SiteUserListPage, SiteUserViewPage } from '@/features/site-users';
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
  { path: ROUTES.adminHome, element: <RequireUserType types={['admin']}><HubPage hub="admin" /></RequireUserType> },
  // List pages open create / view / edit in a drawer; the children only guard those URLs.
  page(ROUTES.adminUsers, 'adminUser.view', <AdminUserListPage />, [
    guardOnly(ROUTES.adminUserNew, 'adminUser.new'),
    guardOnly(ROUTES.adminUserView, 'adminUser.view'),
    guardOnly(ROUTES.adminUserEdit, 'adminUser.edit'),
  ]),
  page(ROUTES.accounts, 'sponsorCoUser.view', <AccountListPage />, [
    guardOnly(ROUTES.accountNew, 'sponsorCoUser.new'),
    guardOnly(ROUTES.accountView, 'sponsorCoUser.view'),
    guardOnly(ROUTES.accountEdit, 'sponsorCoUser.edit'),
  ]),
  page(ROUTES.companyProfile, 'companyProfile.view', <CompanyProfilePage />),
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
  page(ROUTES.accessRights, 'masterDefaultAccessRights.view', <TemplateListPage />),
  page(ROUTES.accessRightsNew, 'masterDefaultAccessRights.new', <TemplateFormPage key="create" mode="create" />),
  page(ROUTES.accessRightsView, 'masterDefaultAccessRights.view', <TemplateViewPage />),
  page(ROUTES.accessRightsEdit, 'masterDefaultAccessRights.edit', <TemplateFormPage key="edit" mode="edit" />),
  { path: ROUTES.master, element: <RequireMasterKey><MasterListPage /></RequireMasterKey> },
  page(ROUTES.ecrfTemplates, 'ecrfTemplate.view', phase2(PAGE_TITLES.ecrfTemplates)),
  page(ROUTES.projects, 'project.view', <ProjectListPage />),
  page(ROUTES.projectNew, 'project.new', <ProjectFormPage key="create" mode="create" />),
];

const siteRoutes: RouteObject = {
  path: ROUTES.siteHub,
  element: <RequireSiteAccess />,
  children: [
    { index: true, element: <SiteHubPage /> },
    page(ROUTES.siteEdit, 'investigatorSite.edit', <SiteFormPage key="edit" mode="edit" />),
    page(ROUTES.siteDashboard, null, phase2(PAGE_TITLES.siteDashboard)),
    page(ROUTES.siteEcrfs, 'siteEcrfs.view', phase2(PAGE_TITLES.siteEcrfs)),
    page(ROUTES.siteQueries, 'siteEcrfQuery.view', phase2(PAGE_TITLES.siteQueries)),
    page(ROUTES.siteCoUsers, 'coUserManagement.view', <CoUserListPage />),
    page(ROUTES.siteCoUserAffiliate, 'coUserManagement.affiliate', <CoUserFormPage key="create" mode="create" />),
    page(ROUTES.siteCoUserView, 'coUserManagement.view', <CoUserViewPage />),
    page(ROUTES.siteCoUserEdit, 'coUserManagement.edit', <CoUserFormPage key="edit" mode="edit" />),
    page(ROUTES.siteUsers, 'siteUserManagement.view', <SiteUserListPage />),
    page(ROUTES.siteUserNew, 'siteUserManagement.new', <SiteUserFormPage key="create" mode="create" />),
    page(ROUTES.siteUserView, 'siteUserManagement.view', <SiteUserViewPage />),
    page(ROUTES.siteUserEdit, 'siteUserManagement.edit', <SiteUserFormPage key="edit" mode="edit" />),
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
    { index: true, element: <RequireUserType types={['sponsor']}><ProjectHubPage /></RequireUserType> },
    page(ROUTES.projectEdit, 'project.edit', <ProjectFormPage key="edit" mode="edit" />),
    {
      path: ROUTES.projectDashboard,
      element: <RequireUserType types={['sponsor']}>{phase2(PAGE_TITLES.projectDashboard)}</RequireUserType>,
    },
    page(ROUTES.projectEcrf, 'projectEcrf.view', phase2(PAGE_TITLES.projectEcrf)),
    page(ROUTES.projectSponsorUsers, 'sponsorUserManagement.view', <SponsorUserListPage />),
    page(
      ROUTES.projectSponsorUserAffiliate,
      'sponsorUserManagement.affiliate',
      <SponsorUserFormPage key="create" mode="create" />,
    ),
    page(ROUTES.projectSponsorUserView, 'sponsorUserManagement.view', <SponsorUserViewPage />),
    page(ROUTES.projectSponsorUserEdit, 'sponsorUserManagement.edit', <SponsorUserFormPage key="edit" mode="edit" />),
    page(ROUTES.projectSites, 'investigatorSite.view', <SiteListPage />),
    page(ROUTES.projectSiteNew, 'investigatorSite.new', <SiteFormPage key="create" mode="create" />),
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
