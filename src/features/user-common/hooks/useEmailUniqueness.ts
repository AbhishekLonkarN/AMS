import { useCallback } from 'react';
import { useUsersStore } from '@/store';
import { isSameText } from '@/utils/string.utils';

/**
 * System-wide email uniqueness (brief §5.11): any user, of any type, other
 * than `excludeUserId` (the record being edited).
 */
export function useEmailUniqueness(excludeUserId?: string) {
  const users = useUsersStore((s) => s.users);
  return useCallback(
    (email: string) => users.some((u) => u.id !== excludeUserId && isSameText(u.email, email)),
    [users, excludeUserId],
  );
}
