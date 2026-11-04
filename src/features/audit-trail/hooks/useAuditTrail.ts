import { useMemo } from 'react';
import { useAuditStore } from '@/store';
import { AUDIT_PAGE_SIZE, AUDIT_TRAIL_LABELS as L } from '../constants/audit-trail.constants';
import { AUDIT_COLUMNS } from '../constants/audit-columns.constants';
import { toAuditRow, type AuditRow } from '../utils/audit-trail.utils';

export function useAuditTrail() {
  const entries = useAuditStore((s) => s.entries);

  // The store keeps newest first; rows mirror that order.
  const rows = useMemo(() => entries.map(toAuditRow), [entries]);

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
