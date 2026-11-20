import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useParticipantsStore, useQueriesStore, useSitesStore } from '@/store';
import { useMasterLabel } from '@/features/masters';
import type { DayPoint } from '@/features/admin-dashboard';
import { SITE_DASHBOARD_LABELS as L } from '../constants/site-dashboard.constants';

const DAY_MS = 86_400_000;

/** Site Dashboard figures: this site's enrolment against its target, enrolment over time and data queries. */
export function useSiteDashboard() {
  const { projectId, siteId } = useParams();
  const site = useSitesStore((s) => s.sites.find((x) => x.id === siteId && x.projectId === projectId));
  const participants = useParticipantsStore((s) => s.participants);
  const queries = useQueriesStore((s) => s.queries);
  const masterLabel = useMasterLabel();

  return useMemo(() => {
    if (!site) {return null;}

    const own = participants.filter((p) => p.siteId === site.id);
    const enrolled = own.filter((p) => p.enrolledAt && !(L.notEnrolledStatusIds as readonly string[]).includes(p.statusId));
    const firstScreened = own.length ? Math.min(...own.map((p) => new Date(p.screenedAt).getTime())) : 0;
    const lastEnrolled = enrolled.length ? Math.max(...enrolled.map((p) => new Date(p.enrolledAt!).getTime())) : 0;

    const weeks = firstScreened && lastEnrolled ? Math.ceil((lastEnrolled - firstScreened) / DAY_MS / L.weekDays) : 0;
    const enrolment: DayPoint[] = Array.from({ length: weeks + 1 }, (_, week) => {
      const day = week * L.weekDays;
      const until = firstScreened + day * DAY_MS;
      const count = enrolled.filter((p) => new Date(p.enrolledAt!).getTime() <= until).length;
      return { key: `d${day}`, label: `D${day}`, title: `Day ${day}: ${count} enrolled`, count };
    });

    const own_queries = queries.filter((q) => q.siteId === site.id);
    const attended = own_queries.filter((q) => q.status === 'read' || q.status === 'responded').length;
    const resolved = own_queries.filter((q) => q.status === 'resolved').length;

    return {
      siteCode: site.siteCode,
      siteName: site.siteName,
      investigator: site.investigatorName,
      location: site.location,
      status: masterLabel(site.statusId),
      recruitment: [
        { id: 'expected', label: L.enrolmentStatus.expected, count: site.expectedRecruitment },
        { id: 'actual', label: L.enrolmentStatus.actual, count: site.actualRecruitment },
      ],
      enrolment,
      hasEnrolment: enrolled.length > 0,
      queries: [
        { id: 'total', label: L.queries.total, count: own_queries.length },
        { id: 'attended', label: L.queries.attended, count: attended },
        { id: 'resolved', label: L.queries.resolved, count: resolved },
      ],
    };
  }, [site, participants, queries, masterLabel]);
}

export type SiteDashboardModel = NonNullable<ReturnType<typeof useSiteDashboard>>;
