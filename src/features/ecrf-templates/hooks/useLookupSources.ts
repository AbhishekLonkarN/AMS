import { useCallback, useMemo } from 'react';
import type { MasterKey } from '@/types';
import type { SelectOption } from '@/components/form';
import type { LookupResolver } from '@/components/dynamic-form';
import { useMastersStore } from '@/store';
import { MASTER_KEYS, MASTER_META } from '@/constants/master.constants';

/** `lookup` fields read live master lists, so a value added to a master shows up in the form. */
export function useLookupSources() {
  const items = useMastersStore((s) => s.items);

  const lookupSources = useMemo<SelectOption[]>(
    () => MASTER_KEYS.map((key) => ({ value: key, label: MASTER_META[key].itemName })),
    []
  );

  const resolveLookup = useCallback<LookupResolver>(
    (source) =>
      items
        .filter((i) => i.masterKey === (source as MasterKey) && i.status === 'active')
        .map((i) => ({ value: i.id, label: i.label })),
    [items]
  );

  return { lookupSources, resolveLookup };
}
