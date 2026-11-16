import { useMemo } from 'react';
import { Activity, Building, CheckCircle2, FolderKanban, Target, UserRoundCheck } from 'lucide-react';
import { useAuditStore, useMastersStore } from '@/store';
import { useAccessibleProjects, useAccessibleSites, useCurrentPrincipal } from '@/rbac';
import {
  ACTIVITY_DAYS,
  auditByDay,
  countRecentEvents,
  projectsByStatus,
  type DonutSegment,
  type KpiView,
} from '@/features/admin-dashboard';
import {
  ONGOING_STATUS_LABEL,
  PERSONAL_DASHBOARD_LABELS as L,
  SITE_STATUS_COLORS,
} from '../constants/personal-dashboard.constants';

/** Everything the sponsor's Personal Dashboard shows, limited to the projects and sites they can access. */
export function usePersonalDashboard() {
  const principal = useCurrentPrincipal();
  const projects = useAccessibleProjects();
  const sites = useAccessibleSites();
  const masters = useMastersStore((s) => s.items);
  const entries = useAuditStore((s) => s.entries);
  const email = principal?.user.email;

  return useMemo(() => {
    const label = (id: string) => masters.find((m) => m.id === id)?.label ?? '—';
    const activity = auditByDay(
      entries.filter((e) => e.userEmail === email),
      ACTIVITY_DAYS,
    );

    const enrolled = sites.reduce((sum, s) => sum + s.actualRecruitment, 0);
    const target = projects.reduce((sum, p) => sum + p.enrolmentTarget, 0);
    const ongoing = projects.filter((p) => label(p.statusId) === ONGOING_STATUS_LABEL).length;

    const kpis: KpiView[] = [
      { key: 'projects', label: L.kpis.projects, value: projects.length, icon: FolderKanban, tone: 'brand' },
      { key: 'ongoing', label: L.kpis.ongoing, value: ongoing, icon: CheckCircle2, tone: 'green' },
      { key: 'sites', label: L.kpis.sites, value: sites.length, icon: Building, tone: 'orange' },
      { key: 'enrolled', label: L.kpis.enrolled, value: enrolled, icon: UserRoundCheck, tone: 'violet' },
      { key: 'target', label: L.kpis.target, value: target, icon: Target, tone: 'red' },
      { key: 'actions', label: L.kpis.actions, value: countRecentEvents(activity), icon: Activity, tone: 'sky' },
    ];

    const siteSegments: DonutSegment[] = projectsByStatus(sites, masters).map((s, i) => ({
      key: s.id,
      label: s.label,
      value: s.count,
      color: SITE_STATUS_COLORS[i % SITE_STATUS_COLORS.length],
    }));

    const enrolmentByProject = projects
      .map((p) => ({
        id: p.id,
        label: p.name,
        count: sites.filter((s) => s.projectId === p.id).reduce((sum, s) => sum + s.actualRecruitment, 0),
      }))
      .filter((p) => p.count > 0)
      .sort((a, b) => b.count - a.count);

    return {
      kpis,
      projectStatuses: projectsByStatus(projects, masters),
      siteSegments,
      totalSites: sites.length,
      enrolmentByProject,
      activity,
    };
  }, [projects, sites, masters, entries, email]);
}

export type PersonalDashboardModel = ReturnType<typeof usePersonalDashboard>;
