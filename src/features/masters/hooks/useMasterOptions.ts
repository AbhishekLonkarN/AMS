import { useCallback, useMemo } from 'react';
import type { MasterKey } from '@/types';
import type { SelectOption } from '@/components/form';
import { useMastersStore, useProductGroupsStore } from '@/store';
import { MASTER_LABELS } from '../constants/masters.constants';
import { useMasterItems } from './useMasterSource';

/**
 * Dropdown options for a master (assumption 8): active values only, plus the
 * record's current value even if it has since been deactivated.
 */
export function useMasterOptions(masterKey: MasterKey, currentId?: string): SelectOption[] {
  const items = useMasterItems(masterKey);
  return useMemo(
    () =>
      items
        .filter((i) => i.status === 'active' || i.id === currentId)
        .map((i) => ({
          value: i.id,
          label: i.status === 'active' ? i.label : `${i.label} ${MASTER_LABELS.inactiveSuffix}`,
          description: i.description,
        })),
    [items, currentId],
  );
}

/** Label lookup for any master value (active or not) that is already loaded. */
export function useMasterLabel() {
  const items = useMastersStore((s) => s.items);
  const groups = useProductGroupsStore((s) => s.groups);
  return useCallback(
    (id?: string) => (items.find((i) => i.id === id) ?? groups.find((g) => g.id === id))?.label ?? '',
    [items, groups],
  );
}
