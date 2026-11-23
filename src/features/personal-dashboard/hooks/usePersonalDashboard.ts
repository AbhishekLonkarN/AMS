import { isEnrolled } from '@/utils/participant.utils';
import { useMemo } from 'react';
import { Activity, Building, CheckCircle2, FolderKanban, Target, UserRoundCheck } from 'lucide-react';
import { useAuditStore, useMastersStore, useParticipantsStore } from '@/store';
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
  const participants = useParticipantsStore((state) => state.participants);
  const email = principal?.user.email;

  return useMemo(() => {
    const label = (id: string) => masters.find((m) => m.id === id)?.label ?? '—';
    const activity = auditByDay(
      entries.filter((e) => e.userEmail === email),
      ACTIVITY_DAYS,
    );

    const siteIds = new Set(sites.map((site) => site.id));
    const enrolled = participants.filter((participant) => siteIds.has(participant.siteId) && isEnrolled(participant));
    const target = projects.reduce((sum, p) => sum + p.enrolmentTarget, 0);
    const ongoing = projects.filter((p) => label(p.statusId) === ONGOING_STATUS_LABEL).length;

    const kpis: KpiView[] = [
      { key: 'projects', label: L.kpis.projects, value: projects.length, icon: FolderKanban, tone: 'brand' },
      { key: 'ongoing', label: L.kpis.ongoing, value: ongoing, icon: CheckCircle2, tone: 'green' },
      { key: 'sites', label: L.kpis.sites, value: sites.length, icon: Building, tone: 'orange' },
      { key: 'enrolled', label: L.kpis.enrolled, value: enrolled.length, icon: UserRoundCheck, tone: 'violet' },
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
        count: enrolled.filter((participant) => participant.projectId === p.id).length,
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
  }, [projects, sites, masters, entries, email, participants]);
}

export type PersonalDashboardModel = ReturnType<typeof usePersonalDashboard>;
