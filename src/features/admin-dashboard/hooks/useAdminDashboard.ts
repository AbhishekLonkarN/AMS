import { useMemo } from 'react';
import { Activity, Building, FolderKanban, UserCheck, UserX, Users, type LucideIcon } from 'lucide-react';
import { useAuditStore, useMastersStore, useProjectsStore, useSitesStore, useUsersStore } from '@/store';
import { usePermissionChecker } from '@/rbac';
import { USER_TYPE_LABELS } from '@/constants/user.constants';
import {
  ACTIVITY_DAYS,
  DASHBOARD_LABELS as L,
  QUICK_ACTIONS,
  RECENT_ACTIVITY_COUNT,
  RECENT_USERS_COUNT,
  USER_TYPE_COLORS,
} from '../constants/admin-dashboard.constants';
import {
  auditByDay,
  classifyEvent,
  countByStatus,
  countRecentEvents,
  countUsersByType,
  projectsByStatus,
  recentlyAdded,
  relativeTime,
} from '../utils/admin-dashboard.utils';

export type KpiTone = 'brand' | 'green' | 'red' | 'violet' | 'orange' | 'sky';

export interface KpiView {
  key: string;
  label: string;
  value: number;
  icon: LucideIcon;
  tone: KpiTone;
}

/** Everything the Admin dashboard shows, derived from the stores. */
export function useAdminDashboard() {
  const users = useUsersStore((s) => s.users);
  const entries = useAuditStore((s) => s.entries);
  const projects = useProjectsStore((s) => s.projects);
  const sites = useSitesStore((s) => s.sites);
  const masters = useMastersStore((s) => s.items);
  const check = usePermissionChecker();

  const data = useMemo(() => {
    const byType = countUsersByType(users);
    const active = countByStatus(users, 'active');
    const activity = auditByDay(entries, ACTIVITY_DAYS);

    const kpis: KpiView[] = [
      { key: 'total-users', label: L.kpis.totalUsers, value: users.length, icon: Users, tone: 'brand' },
      { key: 'active-users', label: L.kpis.activeUsers, value: active, icon: UserCheck, tone: 'green' },
      { key: 'inactive-users', label: L.kpis.inactiveUsers, value: users.length - active, icon: UserX, tone: 'red' },
      { key: 'projects', label: L.kpis.projects, value: projects.length, icon: FolderKanban, tone: 'violet' },
      { key: 'sites', label: L.kpis.sites, value: sites.length, icon: Building, tone: 'orange' },
      { key: 'audit-events', label: L.kpis.auditEvents, value: countRecentEvents(activity), icon: Activity, tone: 'sky' },
    ];

    const userSegments = (Object.keys(byType) as (keyof typeof byType)[]).map((type) => ({
      key: type,
      label: USER_TYPE_LABELS[type],
      value: byType[type],
      color: USER_TYPE_COLORS[type],
    }));

    const recentActivity = entries.slice(0, RECENT_ACTIVITY_COUNT).map((entry) => ({
      id: entry.id,
      kind: classifyEvent(entry.event),
      event: entry.event,
      user: entry.userEmail ?? L.recentActivity.system,
      when: relativeTime(entry.timestamp),
    }));

    return {
      kpis,
      userSegments,
      totalUsers: users.length,
      activeUsers: active,
      inactiveUsers: users.length - active,
      activity,
      projectStatuses: projectsByStatus(projects, masters),
      recentActivity,
      recentUsers: recentlyAdded(users, RECENT_USERS_COUNT),
    };
  }, [users, entries, projects, sites, masters]);

  return {
    ...data,
    quickActions: QUICK_ACTIONS.filter((action) => check(action.permission, 'any')),
    canViewAudit: check('auditTrail.view', 'any'),
    canViewUsers: check(['adminUser.view', 'sponsorCoUser.view'], 'any'),
  };
}
