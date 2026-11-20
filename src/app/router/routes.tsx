import { SiteContactsPage, SupportContactsPage } from '@/features/contacts';
import { BackupPage, CredentialSettingsPage } from '@/features/admin-settings';
import { ProjectSettingsPage } from '@/features/project-workflows/ProjectSettingsPage';
import { ProjectEcrfPage } from '@/features/project-workflows/ProjectEcrfPage';
import { ProjectDashboardPage } from '@/features/project-workflows/ProjectDashboardPage';
import { ProjectQueriesPage } from '@/features/project-workflows/ProjectQueriesPage';
import { ProjectCloseoutPage } from '@/features/project-workflows/ProjectCloseoutPage';
import { SelectiveExportPage } from '@/features/project-workflows/SelectiveExportPage';
import { ParticipantListPage, ParticipantViewPage } from '@/features/site-ecrfs';
import { SiteDashboardPage } from '@/features/site-dashboard';
import { SiteQueryListPage } from '@/features/site-queries';
import { EtmfListPage } from '@/features/etmf';
import type { ReactNode } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import type { PermissionKey } from '@/types';
import { RequirePermission } from '@/rbac';
import {
  CheckEmailPage,
  ContextPickerPage,
  ForgotPasswordPage,
  HomeRedirectPage,
  LoginPage,
  PasswordUpdatedPage,
  ResetPasswordPage,
} from '@/features/auth';
import {
  ForbiddenPage,
  HubPage,
  MASTER_VIEW_PERMISSIONS,
  MastersIndexPage,
  NotFoundPage,
  ShellLayoutPage,
} from '@/features/shell';
import { UiKitPage } from '@/features/ui-kit';
import { AdminDashboardPage } from '@/features/admin-dashboard';
import { PersonalDashboardPage } from '@/features/personal-dashboard';
import { UsersListPage } from '@/features/admin-users';
import { ProjectExportPage } from '@/features/project-export';
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
import { EcrfTemplateListPage } from '@/features/ecrf-templates';
import { PresetLibraryPage } from '@/features/preset-library';
import { RequireAuth, RequireMasterKey, RequireProjectAccess, RequireSiteAccess, RequireUserType } from './guards';
import { ROUTES } from './route-paths.constants';
import { RouteErrorPage } from './RouteErrorPage';

// ---- helpers -------------------------------------------------------------

const guard = (permission: PermissionKey | PermissionKey[], element: ReactNode) => (
  <RequirePermission permission={permission}>{element}</RequirePermission>
);

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
  page(ROUTES.projectExport, 'projectDatabase.export', <ProjectExportPage />),
  // Not in the Admin sidebar for now (routes kept; add a tab or move them inside one later).
  page(ROUTES.cloudSettings, 'cloudSettings.view', <CredentialSettingsPage />),
  page(ROUTES.backup, 'cloudSettings.edit', <BackupPage />),
];

const sponsorRoutes: RouteObject[] = [
  // The Home hub is gone from the sidebar; old links land on the dashboard.
  { path: ROUTES.home, element: <Navigate to={ROUTES.personalDashboard} replace /> },
  page(ROUTES.masters, MASTER_VIEW_PERMISSIONS, <MastersIndexPage />),
  page(ROUTES.accessRights, 'masterDefaultAccessRights.view', <TemplateListPage />, [
    guardOnly(ROUTES.accessRightsNew, 'masterDefaultAccessRights.new'),
    guardOnly(ROUTES.accessRightsView, 'masterDefaultAccessRights.view'),
    guardOnly(ROUTES.accessRightsEdit, 'masterDefaultAccessRights.edit'),
  ]),
  { path: ROUTES.master, element: <RequireMasterKey><MasterListPage /></RequireMasterKey> },
  page(ROUTES.ecrfTemplates, 'ecrfTemplate.view', <EcrfTemplateListPage />, [
    guardOnly(ROUTES.ecrfTemplateNew, 'ecrfTemplate.new'),
    guardOnly(ROUTES.ecrfTemplateEdit, 'ecrfTemplate.edit'),
  ]),
  // Pre-sets are building blocks of eCRF designs, so they share the eCRF Template rights.
  page(ROUTES.presetLibrary, 'ecrfTemplate.view', <PresetLibraryPage />, [
    guardOnly(ROUTES.presetNew, 'ecrfTemplate.new'),
    guardOnly(ROUTES.presetView, 'ecrfTemplate.view'),
    guardOnly(ROUTES.presetEdit, 'ecrfTemplate.edit'),
  ]),
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
    page(ROUTES.siteDashboard, null, <SiteDashboardPage />),
    page(ROUTES.siteEcrfs, 'siteEcrfs.view', <ParticipantListPage />),
    page(ROUTES.siteEcrfParticipant, 'siteEcrfs.view', <ParticipantViewPage />),
    page(ROUTES.siteQueries, 'siteEcrfQuery.view', <SiteQueryListPage />),
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
    page(ROUTES.siteEtmf, 'etmfSite.view', <EtmfListPage scope="site" />),
    page(ROUTES.siteEtmfProject, 'etmfProject.view', <EtmfListPage scope="project" />),
    page(ROUTES.siteSupportContacts, 'supportContacts.view', <SupportContactsPage />),
    page(ROUTES.siteContacts, 'siteContacts.view', <SiteContactsPage />),
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
      element: <RequireUserType types={['sponsor']}>{<ProjectDashboardPage />}</RequireUserType>,
    },
    page(ROUTES.projectEcrf, 'projectEcrf.view', <ProjectEcrfPage />),
    page(ROUTES.projectSponsorUsers, 'sponsorUserManagement.view', <SponsorUserListPage />, [
      guardOnly(ROUTES.projectSponsorUserAffiliate, 'sponsorUserManagement.affiliate'),
      guardOnly(ROUTES.projectSponsorUserView, 'sponsorUserManagement.view'),
      guardOnly(ROUTES.projectSponsorUserEdit, 'sponsorUserManagement.edit'),
    ]),
    page(ROUTES.projectSites, 'investigatorSite.view', <SiteListPage />, [
      guardOnly(ROUTES.projectSiteNew, 'investigatorSite.new'),
      guardOnly(ROUTES.projectSiteListEdit, 'investigatorSite.edit'),
    ]),
    page(ROUTES.projectQueries, 'projectQueriesAll.export', <ProjectQueriesPage />),
    page(ROUTES.projectEtmf, 'etmfProject.view', <EtmfListPage scope="project" />),
    page(ROUTES.projectDatabaseLock, 'projectDatabase.lock', <ProjectCloseoutPage />),
    page(ROUTES.projectSelectiveExport, 'selectiveParticipantData.export', <SelectiveExportPage />),
    page(ROUTES.projectSupportContacts, 'supportContacts.view', <SupportContactsPage />),
    page(ROUTES.projectSettings, 'settings.view', <ProjectSettingsPage />),
    siteRoutes,
  ],
};

const routes: RouteObject[] = [
  { path: ROUTES.login, element: <LoginPage />, errorElement: <RouteErrorPage /> },
  // Forgot password: four signed-out steps (ask for email, check email, new password, done)
  { path: ROUTES.forgotPassword, element: <ForgotPasswordPage />, errorElement: <RouteErrorPage /> },
  { path: ROUTES.forgotPasswordSent, element: <CheckEmailPage />, errorElement: <RouteErrorPage /> },
  { path: ROUTES.resetPassword, element: <ResetPasswordPage />, errorElement: <RouteErrorPage /> },
  { path: ROUTES.passwordUpdated, element: <PasswordUpdatedPage />, errorElement: <RouteErrorPage /> },
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
          {
            path: ROUTES.personalDashboard,
            element: <RequireUserType types={['sponsor', 'co', 'site']}><PersonalDashboardPage /></RequireUserType>,
          },
          { path: ROUTES.uiKit, element: <UiKitPage /> },
          page(ROUTES.auditTrail, 'auditTrail.view', <AuditTrailPage />),
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
