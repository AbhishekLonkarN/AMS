import { useState } from 'react';
import { Ban, RotateCcw, Unlink, type LucideIcon } from 'lucide-react';
import { notify, useSessionStore } from '@/store';
import { AFFILIATION_LABELS as L } from '../constants/affiliation.constants';
import { USER_ACTION_LABELS as A } from '../constants/user-common.constants';
import type { AffiliationRow } from '../constants/affiliation-columns.constants';
import type { StatusToggleConfirm } from './useUserStatusToggle';

/** Deaffiliate (affiliations) or Deactivate / Re-activate (site memberships). */
export type EndAction =
  | { kind: 'deaffiliate'; isAllowed: boolean; run: (id: string) => void }
  | { kind: 'toggleStatus'; isAllowed: boolean; run: (id: string, isActivating: boolean) => void };

export type EndTarget = Pick<AffiliationRow, 'id' | 'userId' | 'name' | 'statusKind'>;

interface EndActionButton {
  key: string;
  label: string;
  icon: LucideIcon;
  tone: 'default' | 'danger';
  onClick: () => void;
}

/**
 * The "end access" action + its confirm dialog, shared by the list row menus
 * and the View drawer toolbar. `whereLabel` ("RESTORE", "FR-006") goes in the message.
 */
export function useEndAction(endAction: EndAction, whereLabel: string) {
  const currentUserId = useSessionStore((s) => s.currentUserId);
  const [pending, setPending] = useState<EndTarget | null>(null);

  const isDeaffiliate = endAction.kind === 'deaffiliate';
  const isActivating = !isDeaffiliate && pending?.statusKind !== 'active';

  /** The button for a record, or null when not allowed (ended, own record, no right). */
  const actionFor = (target: EndTarget): EndActionButton | null => {
    // Nobody can end their own access from here.
    if (!endAction.isAllowed || target.statusKind === 'deaffiliated' || target.userId === currentUserId) return null;
    const onClick = () => setPending(target);
    if (isDeaffiliate) return { key: 'end', label: L.deaffiliate, icon: Unlink, tone: 'danger', onClick };
    const isActive = target.statusKind === 'active';
    return {
      key: 'end',
      label: isActive ? A.deactivate : A.reactivate,
      icon: isActive ? Ban : RotateCcw,
      tone: isActive ? 'danger' : 'default',
      onClick,
    };
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

  return { actionFor, confirm };
}
