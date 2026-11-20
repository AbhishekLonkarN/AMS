import { useMemo } from 'react';
import { useAccessibleProjects, useCurrentPrincipal } from '@/rbac';
import { useAuditStore } from '@/store';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { AUDIT_PAGE_SIZE, AUDIT_TRAIL_LABELS as L } from '../constants/audit-trail.constants';
import { AUDIT_COLUMNS } from '../constants/audit-columns.constants';
import { toAuditRow, type AuditRow } from '../utils/audit-trail.utils';

export function useAuditTrail() {
  const entries = useAuditStore((s) => s.entries);

  const principal = useCurrentPrincipal();
  const projects = useAccessibleProjects();
  const rows = useMemo(() => {
    if (!principal) return [];
    if (principal.user.userType === 'admin') {
      return entries.map((entry) => {
        const clinical = !!entry.participantId || entry.page === AUDIT_PAGES.siteEcrfs || entry.page === AUDIT_PAGES.siteQueries;
        return toAuditRow(clinical ? { ...entry, participantId: undefined, event: 'Clinical record activity', originalValue: undefined, changedTo: undefined } : entry);
      });
    }
    const ids = new Set(projects.map((project) => project.id));
    const names = new Set(projects.map((project) => project.name));
    return entries.filter((entry) => entry.projectId ? ids.has(entry.projectId) : !!entry.projectName && names.has(entry.projectName)).map(toAuditRow);
  }, [entries, principal, projects]);

  return {
    title: L.title,
    description: L.description,
    rows,
    columns: AUDIT_COLUMNS,
    getRowId: (r: AuditRow) => r.id,
    pageSize: AUDIT_PAGE_SIZE,
    searchPlaceholder: L.searchPlaceholder,
    emptyTitle: L.emptyTitle,
    emptyDescription: L.emptyDescription,
  };
}

export type AuditTrailModel = ReturnType<typeof useAuditTrail>;
