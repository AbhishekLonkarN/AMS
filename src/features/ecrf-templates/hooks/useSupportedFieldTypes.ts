import { useEffect, useState } from 'react';
import type { FieldType } from '@/components/dynamic-form';
import { getSupportedFieldTypes, SAVABLE_FIELD_TYPES } from '@/api';

// The catalog only changes with a backend release, so it is fetched once per page load.
let cached: Promise<FieldType[]> | null = null;

/**
 * Field types the builder may offer: those the backend's Form Builder catalog lists. Until the
 * catalog arrives (or if it can't be read) every type the backend can store is offered; the
 * backend still checks the design on save.
 */
export function useSupportedFieldTypes(): readonly FieldType[] {
  const [types, setTypes] = useState<readonly FieldType[]>(SAVABLE_FIELD_TYPES);

  useEffect(() => {
    let isCurrent = true;
    if (!cached) {
      cached = getSupportedFieldTypes().catch((error: unknown) => {
        cached = null; // try again next time
        throw error;
      });
    }
    cached.then(
      (next) => {
        if (isCurrent) {
          setTypes(next);
        }
      },
      () => undefined,
    );
    return () => {
      isCurrent = false;
    };
  }, []);

  return types;
}
