import { useMemo } from 'react';
import type { DemoUserOption } from '@/components/layout';
import { useUsersStore } from '@/store';
import { fullName } from '@/utils/string.utils';
import { DEMO_USERS } from '../constants/auth.constants';

export function useDemoUsers(): DemoUserOption[] {
  const users = useUsersStore((s) => s.users);
  return useMemo(
    () =>
      DEMO_USERS.flatMap(({ userId, roleLabel }) => {
        const user = users.find((u) => u.id === userId);
        return user ? [{ userId, roleLabel, name: fullName(user.prefix, user.name) }] : [];
      }),
    [users],
  );
}
