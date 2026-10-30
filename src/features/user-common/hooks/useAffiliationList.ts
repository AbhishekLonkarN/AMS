import { useMemo, useState } from 'react';
import { Ban, Eye, Pencil, RotateCcw, Unlink } from 'lucide-react';
import type { RowAction } from '@/components/data-grid';
import { notify, useSessionStore } from '@/store';
import { AFFILIATION_LABELS as L } from '../constants/affiliation.constants';
import { USER_ACTION_LABELS as A } from '../constants/user-common.constants';
import { buildAffiliationColumns, type AffiliationRow } from '../constants/affiliation-columns.constants';
import type { StatusToggleConfirm } from './useUserStatusToggle';

interface AffiliationListOptions {
  rows: AffiliationRow[];
  hasOrganization: boolean;
  /** "RESTORE" or "site FR-006": used in the confirm message. */
  whereLabel: string;
  canView: boolean;
  canEdit: boolean;
  /** Deaffiliate (affiliations) or Deactivate / Re-activate (site memberships). */
  endAction: { kind: 'deaffiliate'; isAllowed: boolean; run: (id: string) => void } | {
    kind: 'toggleStatus';
    isAllowed: boolean;
    run: (id: string, isActivating: boolean) => void;
  };
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
  const currentUserId = useSessionStore((s) => s.currentUserId);
  const [pending, setPending] = useState<AffiliationRow | null>(null);
  const columns = useMemo(() => buildAffiliationColumns({ hasOrganization }), [hasOrganization]);

  const isDeaffiliate = endAction.kind === 'deaffiliate';
  const isActivating = !isDeaffiliate && pending?.statusKind !== 'active';

  const rowActions = (row: AffiliationRow): RowAction[] => {
    const actions: RowAction[] = [];
    const isEnded = row.statusKind === 'deaffiliated';
    if (canView) actions.push({ key: 'view', label: L.view, icon: Eye, onClick: () => onView(row.id) });
    if (canEdit && !isEnded) actions.push({ key: 'edit', label: L.edit, icon: Pencil, onClick: () => onEdit(row.id) });
    // Nobody can end their own access from here.
    if (endAction.isAllowed && !isEnded && row.userId !== currentUserId) {
      if (isDeaffiliate) {
        actions.push({ key: 'end', label: L.deaffiliate, icon: Unlink, tone: 'danger', onClick: () => setPending(row) });
      } else {
        const isActive = row.statusKind === 'active';
        actions.push({
          key: 'end',
          label: isActive ? A.deactivate : A.reactivate,
          icon: isActive ? Ban : RotateCcw,
          tone: isActive ? 'danger' : 'default',
          onClick: () => setPending(row),
        });
      }
    }
    return actions;
  };

  const name = pending?.name ?? '';
  const confirm: StatusToggleConfirm = isDeaffiliate
    ? {
        isOpen: !!pending,
        title: L.confirmDeaffiliateTitle,
        message: L.confirmDeaffiliate(name, whereLabel),
        confirmLabel: L.deaffiliate,
        tone: 'danger',
        onConfirm: () => {
          if (!pending) return;
          endAction.run(pending.id);
          notify.success(L.deaffiliated(name));
          setPending(null);
        },
        onCancel: () => setPending(null),
      }
    : {
        isOpen: !!pending,
        title: isActivating ? A.confirmReactivateTitle : A.confirmDeactivateTitle,
        message: isActivating ? A.confirmReactivate(name) : A.confirmDeactivate(name),
        confirmLabel: isActivating ? A.reactivate : A.deactivate,
        tone: isActivating ? 'primary' : 'danger',
        onConfirm: () => {
          if (!pending || endAction.kind !== 'toggleStatus') return;
          endAction.run(pending.id, isActivating);
          notify.success(isActivating ? A.reactivated(name) : A.deactivated(name));
          setPending(null);
        },
        onCancel: () => setPending(null),
      };

  return {
    columns,
    data: rows,
    getRowId: (r: AffiliationRow) => r.id,
    rowActions,
    isRowMuted: (r: AffiliationRow) => r.statusKind !== 'active',
    confirm,
  };
}
