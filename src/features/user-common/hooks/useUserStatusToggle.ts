import { useState } from 'react';
import type { User } from '@/types';
import { notify, useUsersStore } from '@/store';
import { fullName } from '@/utils/string.utils';
import { USER_ACTION_LABELS as L } from '../constants/user-common.constants';

/** Deactivate / Re-activate with a confirm dialog. Nothing is hard-deleted (assumption 6). */
export function useUserStatusToggle() {
  const setUserStatus = useUsersStore((s) => s.setUserStatus);
  const [pending, setPending] = useState<User | null>(null);

  const isDeactivating = pending?.status === 'active';
  const name = pending ? fullName(pending.prefix, pending.name) : '';

  const handleConfirm = () => {
    if (!pending) return;
    setUserStatus(pending.id, isDeactivating ? 'inactive' : 'active');
    notify.success(isDeactivating ? L.deactivated(name) : L.reactivated(name));
    setPending(null);
  };

  return {
    requestToggle: setPending,
    confirm: <StatusToggleConfirm>{
      isOpen: !!pending,
      title: isDeactivating ? L.confirmDeactivateTitle : L.confirmReactivateTitle,
      message: isDeactivating ? L.confirmDeactivate(name) : L.confirmReactivate(name),
      confirmLabel: isDeactivating ? L.deactivate : L.reactivate,
      tone: isDeactivating ? ('danger' as const) : ('primary' as const),
      onConfirm: handleConfirm,
      onCancel: () => setPending(null),
    },
  };
}

/** Props for a list's Deactivate / Re-activate / Deaffiliate confirm dialog. */
export interface StatusToggleConfirm {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  tone: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}
