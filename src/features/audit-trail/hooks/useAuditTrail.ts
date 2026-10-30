import { useMemo } from 'react';
import { notify, useAuditStore } from '@/store';
import { usePermission } from '@/rbac';
import { AUDIT_PAGE_SIZE, AUDIT_TRAIL_LABELS as L } from '../constants/audit-trail.constants';
import { AUDIT_COLUMNS } from '../constants/audit-columns.constants';
import { toAuditRow, type AuditRow } from '../utils/audit-trail.utils';

export function useAuditTrail() {
  const entries = useAuditStore((s) => s.entries);
  const canExport = usePermission('auditTrail.export');

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
    exportActions: canExport
      ? { onExcel: () => notify.phase2(L.exportName), onPdf: () => notify.phase2(L.exportName) }
      : undefined,
  };
}

export type AuditTrailModel = ReturnType<typeof useAuditTrail>;
