import { useMemo } from 'react';
import { Eye, Pencil } from 'lucide-react';
import type { RowAction } from '@/components/data-grid';
import { AFFILIATION_LABELS as L } from '../constants/affiliation.constants';
import { buildAffiliationColumns, type AffiliationRow } from '../constants/affiliation-columns.constants';
import { useEndAction, type EndAction } from './useEndAction';

interface AffiliationListOptions {
  rows: AffiliationRow[];
  hasOrganization: boolean;
  /** "RESTORE" or "site FR-006": used in the confirm message. */
  whereLabel: string;
  canView: boolean;
  canEdit: boolean;
  endAction: EndAction;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

/** Row actions + confirm dialog shared by Sponsor, CO and Site user lists. */
export function useAffiliationList({
  rows,
  hasOrganization,
  whereLabel,
  canView,
  canEdit,
  endAction,
  onView,
  onEdit,
}: AffiliationListOptions) {
  const columns = useMemo(() => buildAffiliationColumns({ hasOrganization }), [hasOrganization]);
  const end = useEndAction(endAction, whereLabel);

  const rowActions = (row: AffiliationRow): RowAction[] => {
    const actions: RowAction[] = [];
    const isEnded = row.statusKind === 'deaffiliated';
    if (canView) actions.push({ key: 'view', label: L.view, icon: Eye, onClick: () => onView(row.id) });
    if (canEdit && !isEnded) actions.push({ key: 'edit', label: L.edit, icon: Pencil, onClick: () => onEdit(row.id) });
    const endButton = end.actionFor(row);
    if (endButton) actions.push(endButton);
    return actions;
  };

  return {
    columns,
    data: rows,
    getRowId: (r: AffiliationRow) => r.id,
    rowActions,
    isRowMuted: (r: AffiliationRow) => r.statusKind !== 'active',
    confirm: end.confirm,
  };
}
