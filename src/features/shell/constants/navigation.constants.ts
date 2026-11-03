import {
  BarChart3,
  Building2,
  ClipboardList,
  Contact,
  Database,
  FileArchive,
  FileDown,
  FileStack,
  FolderKanban,
  FolderOpen,
  Gauge,
  History,
  Home,
  Hospital,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  Library,
  Lock,
  MessageSquareWarning,
  Settings,
  ShieldCheck,
  Tags,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { PermissionKey, UserType } from '@/types';
import { ROUTES, paths } from '@/app/router/route-paths.constants';
import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '@/constants/page-titles.constants';
import { MASTER_META } from '@/constants/master.constants';

export interface NavContext {
  projectId?: string;
  siteId?: string;
}

export interface NavItemConfig {
  key: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  to: (ctx: Required<NavContext>) => string;
  /** View permission (any-of for arrays). Omitted = visible to every audience member. */
  permission?: PermissionKey | PermissionKey[];
  audiences?: UserType[];
  /** Sidebar only, never a hub tile (e.g. Home / Overview links). */
  isHubHidden?: boolean;
  isEnd?: boolean;
  children?: NavItemConfig[];
}

export type NavSectionKey = 'admin' | 'sponsor' | 'mySites' | 'project' | 'site';

export interface NavSectionConfig {
  key: NavSectionKey;
  audiences: UserType[];
  /** Which route context the section needs; its items are checked against that scope. */
  context: 'none' | 'project' | 'site';
  items: NavItemConfig[];
}

const fixed = (path: string) => () => path;

const MASTER_ITEMS: NavItemConfig[] = [
  {
    key: 'master-access-rights',
    label: PAGE_TITLES.accessRights,
    description: PAGE_DESCRIPTIONS.accessRights,
    icon: KeyRound,
    to: fixed(ROUTES.accessRights),
    permission: 'masterDefaultAccessRights.view',
  },
  {
    key: 'master-product-group',
    label: MASTER_META.productGroup.title,
    description: PAGE_DESCRIPTIONS.productGroup,
    icon: Tags,
    to: () => paths.master('productGroup'),
    permission: 'masterProductGroup.view',
  },
  {
    key: 'master-project-status',
    label: MASTER_META.projectStatus.title,
    description: PAGE_DESCRIPTIONS.projectStatus,
    icon: Tags,
    to: () => paths.master('projectStatus'),
    permission: 'masterProjectStatus.view',
  },
  {
    key: 'master-site-status',
    label: MASTER_META.siteStatus.title,
    description: PAGE_DESCRIPTIONS.siteStatus,
    icon: Tags,
    to: () => paths.master('siteStatus'),
    permission: 'masterSiteStatus.view',
  },
  {
    key: 'master-participant-status',
    label: MASTER_META.participantStatus.title,
    description: PAGE_DESCRIPTIONS.participantStatus,
    icon: Tags,
    to: () => paths.master('participantStatus'),
    permission: 'masterParticipantStatus.view',
  },
];

export const MASTER_VIEW_PERMISSIONS = MASTER_ITEMS.map((i) => i.permission as PermissionKey);

export const NAV_SECTIONS: NavSectionConfig[] = [
  // ---------------- Admin portal ----------------
  // Sidebar: Dashboard · Company Profile · Users · Project Export · Audit Trail
  {
    key: 'admin',
    audiences: ['admin'],
    context: 'none',
    items: [
      {
        key: 'admin-dashboard',
        label: PAGE_TITLES.dashboard,
        icon: LayoutDashboard,
        to: fixed(ROUTES.adminHome),
        isHubHidden: true,
        isEnd: true,
      },
      {
        key: 'company-profile',
        label: PAGE_TITLES.companyProfile,
        description: PAGE_DESCRIPTIONS.companyProfile,
        icon: Building2,
        to: fixed(ROUTES.companyProfile),
        permission: 'companyProfile.view',
      },
      {
        key: 'users',
        label: PAGE_TITLES.users,
        description: PAGE_DESCRIPTIONS.users,
        icon: Users,
        to: fixed(ROUTES.users),
        // Holds both lists (Admin Users, Sponsor & CO Users); visible with either view right.
        permission: ['adminUser.view', 'sponsorCoUser.view'],
      },
      {
        key: 'admin-project-export',
        label: PAGE_TITLES.projectExport,
        description: PAGE_DESCRIPTIONS.projectExport,
        icon: FileDown,
        to: fixed(ROUTES.projectExport),
        permission: 'projectDatabase.export',
      },
      {
        key: 'admin-audit',
        label: PAGE_TITLES.auditTrail,
        description: PAGE_DESCRIPTIONS.auditTrail,
        icon: History,
        to: fixed(ROUTES.auditTrail),
        permission: 'auditTrail.view',
      },
    ],
  },

  // ---------------- Sponsor portal (global) ----------------
  {
    key: 'sponsor',
    audiences: ['sponsor'],
    context: 'none',
    items: [
      { key: 'sponsor-home', label: PAGE_TITLES.home, icon: Home, to: fixed(ROUTES.home), isHubHidden: true, isEnd: true },
      {
        key: 'personal-dashboard',
        label: PAGE_TITLES.personalDashboard,
        description: PAGE_DESCRIPTIONS.personalDashboard,
        icon: Gauge,
        to: fixed(ROUTES.personalDashboard),
      },
      {
        key: 'masters',
        label: PAGE_TITLES.masters,
        description: PAGE_DESCRIPTIONS.masters,
        icon: Library,
        to: fixed(ROUTES.masters),
        permission: MASTER_VIEW_PERMISSIONS,
        isEnd: true,
        children: MASTER_ITEMS,
      },
      {
        key: 'ecrf-templates',
        label: PAGE_TITLES.ecrfTemplates,
        description: PAGE_DESCRIPTIONS.ecrfTemplates,
        icon: FileStack,
        to: fixed(ROUTES.ecrfTemplates),
        permission: 'ecrfTemplate.view',
      },
      {
        key: 'projects',
        label: PAGE_TITLES.projects,
        description: PAGE_DESCRIPTIONS.projects,
        icon: FolderKanban,
        to: fixed(ROUTES.projects),
        permission: 'project.view',
        isEnd: true,
      },
      {
        key: 'sponsor-db-export',
        label: PAGE_TITLES.databaseExport,
        description: PAGE_DESCRIPTIONS.databaseExport,
        icon: FileDown,
        to: fixed(ROUTES.databaseExport),
        permission: 'projectDatabase.export',
      },
      {
        key: 'sponsor-audit',
        label: PAGE_TITLES.auditTrail,
        description: PAGE_DESCRIPTIONS.auditTrail,
        icon: History,
        to: fixed(ROUTES.auditTrail),
        permission: 'auditTrail.view',
      },
    ],
  },

  // ---------------- CO / site users: site picker ----------------
  {
    key: 'mySites',
    audiences: ['co', 'site'],
    context: 'none',
    items: [{ key: 'my-sites', label: PAGE_TITLES.selectContext, icon: LayoutGrid, to: fixed(ROUTES.selectContext) }],
  },

  // ---------------- Project hub ----------------
  {
    key: 'project',
    audiences: ['sponsor'],
    context: 'project',
    items: [
      {
        key: 'project-overview',
        label: PAGE_TITLES.projectOverview,
        icon: LayoutGrid,
        to: (c) => paths.projectHub(c.projectId),
        isHubHidden: true,
        isEnd: true,
      },
      {
        key: 'project-dashboard',
        label: PAGE_TITLES.projectDashboard,
        description: PAGE_DESCRIPTIONS.projectDashboard,
        icon: BarChart3,
        to: (c) => paths.projectDashboard(c.projectId),
      },
      {
        key: 'project-ecrf',
        label: PAGE_TITLES.projectEcrf,
        description: PAGE_DESCRIPTIONS.projectEcrf,
        icon: ClipboardList,
        to: (c) => paths.projectEcrf(c.projectId),
        permission: 'projectEcrf.view',
      },
      {
        key: 'project-sponsor-users',
        label: PAGE_TITLES.sponsorUsers,
        description: PAGE_DESCRIPTIONS.sponsorUsers,
        icon: Users,
        to: (c) => paths.projectSponsorUsers(c.projectId),
        permission: 'sponsorUserManagement.view',
      },
      {
        key: 'project-sites',
        label: PAGE_TITLES.sites,
        description: PAGE_DESCRIPTIONS.sites,
        icon: Hospital,
        to: (c) => paths.projectSites(c.projectId),
        permission: 'investigatorSite.view',
        isEnd: true,
      },
      {
        key: 'project-queries',
        label: PAGE_TITLES.projectQueries,
        description: PAGE_DESCRIPTIONS.projectQueries,
        icon: MessageSquareWarning,
        to: (c) => paths.projectQueries(c.projectId),
        permission: 'projectQueriesAll.export',
      },
      {
        key: 'project-etmf',
        label: PAGE_TITLES.projectEtmf,
        description: PAGE_DESCRIPTIONS.projectEtmf,
        icon: FolderOpen,
        to: (c) => paths.projectEtmf(c.projectId),
        permission: 'etmfProject.view',
      },
      {
        key: 'project-db-lock',
        label: PAGE_TITLES.projectDatabaseLock,
        description: PAGE_DESCRIPTIONS.projectDatabaseLock,
        icon: Lock,
        to: (c) => paths.projectDatabaseLock(c.projectId),
        permission: 'projectDatabase.lock',
      },
      {
        key: 'project-selective-export',
        label: PAGE_TITLES.selectiveExport,
        description: PAGE_DESCRIPTIONS.selectiveExport,
        icon: FileArchive,
        to: (c) => paths.projectSelectiveExport(c.projectId),
        permission: 'selectiveParticipantData.export',
      },
      {
        key: 'project-db-export',
        label: PAGE_TITLES.databaseExport,
        description: PAGE_DESCRIPTIONS.databaseExport,
        icon: Database,
        to: (c) => paths.projectDatabaseExport(c.projectId),
        permission: 'projectDatabase.export',
      },
      {
        key: 'project-support-contacts',
        label: PAGE_TITLES.supportContacts,
        description: PAGE_DESCRIPTIONS.supportContacts,
        icon: Contact,
        to: (c) => paths.projectSupportContacts(c.projectId),
        permission: 'supportContacts.view',
      },
      {
        key: 'project-settings',
        label: PAGE_TITLES.projectSettings,
        description: PAGE_DESCRIPTIONS.projectSettings,
        icon: Settings,
        to: (c) => paths.projectSettings(c.projectId),
        permission: 'settings.view',
      },
    ],
  },

  // ---------------- Site hub ----------------
  {
    key: 'site',
    audiences: ['sponsor', 'co', 'site'],
    context: 'site',
    items: [
      {
        key: 'site-overview',
        label: PAGE_TITLES.siteOverview,
        icon: LayoutGrid,
        to: (c) => paths.siteHub(c.projectId, c.siteId),
        isHubHidden: true,
        isEnd: true,
      },
      {
        key: 'site-dashboard',
        label: PAGE_TITLES.siteDashboard,
        description: PAGE_DESCRIPTIONS.siteDashboard,
        icon: BarChart3,
        to: (c) => paths.siteDashboard(c.projectId, c.siteId),
      },
      {
        key: 'site-ecrfs',
        label: PAGE_TITLES.siteEcrfs,
        description: PAGE_DESCRIPTIONS.siteEcrfs,
        icon: ClipboardList,
        to: (c) => paths.siteEcrfs(c.projectId, c.siteId),
        permission: 'siteEcrfs.view',
      },
      {
        key: 'site-queries',
        label: PAGE_TITLES.siteQueries,
        description: PAGE_DESCRIPTIONS.siteQueries,
        icon: MessageSquareWarning,
        to: (c) => paths.siteQueries(c.projectId, c.siteId),
        permission: 'siteEcrfQuery.view',
      },
      {
        key: 'site-co-users',
        label: PAGE_TITLES.coUsers,
        description: PAGE_DESCRIPTIONS.coUsers,
        icon: ShieldCheck,
        to: (c) => paths.siteCoUsers(c.projectId, c.siteId),
        permission: 'coUserManagement.view',
      },
      {
        key: 'site-users',
        label: PAGE_TITLES.siteUsers,
        description: PAGE_DESCRIPTIONS.siteUsers,
        icon: UserPlus,
        to: (c) => paths.siteUsers(c.projectId, c.siteId),
        permission: 'siteUserManagement.view',
      },
      {
        key: 'site-etmf-project',
        label: PAGE_TITLES.projectEtmf,
        description: PAGE_DESCRIPTIONS.projectEtmf,
        icon: FolderOpen,
        to: (c) => paths.siteEtmfProject(c.projectId, c.siteId),
        permission: 'etmfProject.view',
        audiences: ['co', 'site'],
      },
      {
        key: 'site-etmf',
        label: PAGE_TITLES.siteEtmf,
        description: PAGE_DESCRIPTIONS.siteEtmf,
        icon: FolderOpen,
        to: (c) => paths.siteEtmf(c.projectId, c.siteId),
        permission: 'etmfSite.view',
      },
      {
        key: 'site-support-contacts',
        label: PAGE_TITLES.supportContacts,
        description: PAGE_DESCRIPTIONS.supportContacts,
        icon: Contact,
        to: (c) => paths.siteSupportContacts(c.projectId, c.siteId),
        permission: 'supportContacts.view',
        audiences: ['co', 'site'],
      },
      {
        key: 'site-contacts',
        label: PAGE_TITLES.siteContacts,
        description: PAGE_DESCRIPTIONS.siteContacts,
        icon: Contact,
        to: (c) => paths.siteContacts(c.projectId, c.siteId),
        permission: 'siteContacts.view',
      },
    ],
  },
];
