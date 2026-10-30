import { useMemo } from 'react';
import { useUsersStore } from '@/store';
import { useDemoUsers } from '@/features/auth';
import { ASSUMPTION_SECTIONS, DEMO_GUIDE, PHASE2_MODULES } from '../constants/assumptions.constants';

export function useAssumptions() {
  const demoUsers = useDemoUsers();
  const users = useUsersStore((s) => s.users);

  const demoRows = useMemo(
    () =>
      demoUsers.map((d) => ({
        key: d.userId,
        role: d.roleLabel,
        name: d.name,
        email: users.find((u) => u.id === d.userId)?.email ?? '',
        tryThis: DEMO_GUIDE[d.userId] ?? '',
      })),
    [demoUsers, users],
  );

  // Number items continuously across sections so they can be referred to as "#12".
  const sections = useMemo(() => {
    let n = 0;
    return ASSUMPTION_SECTIONS.map((section) => ({
      ...section,
      items: section.items.map((item) => ({ ...item, number: (n += 1) })),
    }));
  }, []);

  return { sections, demoRows, phase2Modules: PHASE2_MODULES };
}

export type AssumptionsModel = ReturnType<typeof useAssumptions>;
