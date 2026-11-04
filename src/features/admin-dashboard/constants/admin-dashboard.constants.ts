import { Building2, FileDown, History, UserPlus, Users, type LucideIcon } from 'lucide-react';
import type { PermissionKey, UserType } from '@/types';
import { ROUTES } from '@/app/router/route-paths.constants';

export const DASHBOARD_LABELS = {
  title: 'Dashboard',
  description: 'A quick look at users, projects and recent activity across the system.',
  kpis: {
    totalUsers: 'Total users',
    activeUsers: 'Active users',
    inactiveUsers: 'In-active users',
    projects: 'Projects',
    sites: 'Sites',
    auditEvents: 'Audit events (7 days)',
  },
  usersByType: { title: 'Users by type', total: 'Users', active: 'Active', inactive: 'In-active' },
  activity: { title: 'Day wise activity', subtitle: 'Last 30 days', empty: 'No audit events yet.' },
  projectsByStatus: { title: 'Projects by status', empty: 'No projects yet.' },
  recentActivity: { title: 'Recent activity', viewAll: 'View all', empty: 'No activity recorded yet.', system: 'System' },
  quickActions: { title: 'Quick actions' },
  recentUsers: { title: 'Recently added users', viewAll: 'View all', empty: 'No users yet.' },
} as const;

export const ACTIVITY_DAYS = 30;
export const RECENT_ACTIVITY_COUNT = 30;
export const RECENT_USERS_COUNT = 15;

/** Avatar colours for the recently added users; each user keeps the same one (picked from the email). */
export const AVATAR_COLORS = ['#059669', '#ea580c', '#9333ea', '#4338ca', '#2563eb', '#475569', '#0d9488', '#db2777'];

/** Chart colours per user type (design tokens). */
export const USER_TYPE_COLORS: Record<UserType, string> = {
  admin: 'var(--color-brand-700)',
  sponsor: 'var(--color-accent-500)',
  co: 'var(--color-tone-violet)',
  site: 'var(--color-tone-orange)',
};

export interface QuickActionConfig {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  to: string;
  permission: PermissionKey;
}

export const QUICK_ACTIONS: QuickActionConfig[] = [
  {
    key: 'add-admin-user',
    label: 'Add admin user',
    description: 'Create an AMS IT Admin account',
    icon: UserPlus,
    to: ROUTES.adminUserNew,
    permission: 'adminUser.new',
  },
  {
    key: 'add-account',
    label: 'Add Sponsor / CO user',
    description: 'Create a Sponsor or CO account',
    icon: Users,
    to: ROUTES.accountNew,
    permission: 'sponsorCoUser.new',
  },
  {
    key: 'edit-company-profile',
    label: 'Edit company profile',
    description: 'Software and owner company details',
    icon: Building2,
    to: ROUTES.companyProfile,
    permission: 'companyProfile.edit',
  },
  {
    key: 'export-project',
    label: 'Export project data',
    description: 'Download a project database',
    icon: FileDown,
    to: ROUTES.projectExport,
    permission: 'projectDatabase.export',
  },
  {
    key: 'view-audit-trail',
    label: 'View audit trail',
    description: 'Every change, login and access update',
    icon: History,
    to: ROUTES.auditTrail,
    permission: 'auditTrail.view',
  },
];
