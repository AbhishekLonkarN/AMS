import { useMemo } from 'react';
import type { AccountType } from '@/types';
import type { SelectOption } from '@/components/form';
import { useUsersStore } from '@/store';
import { RECORD_STATUS_LABELS } from '@/constants/user.constants';
import { fullName } from '@/utils/string.utils';

/** Active sponsor or CO accounts (plus the currently selected one even if In-active). */
export function useAccountOptions(accountType: AccountType, currentId?: string): SelectOption[] {
  const users = useUsersStore((s) => s.users);
  return useMemo(
    () =>
      users
        .filter((u) => u.accountType === accountType && (u.status === 'active' || u.id === currentId))
        .map((u) => ({
          value: u.id,
          label: `${fullName(u.prefix, u.name)} (${u.organization})${u.status === 'active' ? '' : ` – ${RECORD_STATUS_LABELS.inactive}`}`,
        })),
    [users, accountType, currentId],
  );
}
