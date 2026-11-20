import { useCallback, useEffect, useRef, useState } from 'react';
import type { Preset } from '@/types';
import { ApiError, getPreset } from '@/api';
import { usePresetsStore } from '@/store';

export type PresetRecordState =
  | { status: 'none' }
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'failed'; message: string }
  | { status: 'ready'; preset: Preset };

/**
 * One pre-set: from the loaded list when it is there (kept current by every save), else
 * fetched, so a bookmarked or shared link works. No id: nothing to load.
 */
export function usePresetRecord(presetId?: string) {
  const inList = usePresetsStore((s) => s.presets.find((p) => p.id === presetId));
  // Once seen, a pre-set is kept: deleting it from its own drawer must not flash "not found"
  // while the drawer slides shut.
  const lastSeen = useRef<Preset | undefined>(undefined);
  if (inList) {
    lastSeen.current = inList;
  }
  const fromList = inList ?? (lastSeen.current?.id === presetId ? lastSeen.current : undefined);
  const [fetched, setFetched] = useState<PresetRecordState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  const isInList = !!fromList;

  useEffect(() => {
    if (!presetId || isInList) {
      return undefined;
    }
    let isCurrent = true;
    setFetched({ status: 'loading' });
    getPreset(presetId).then(
      (preset) => {
        if (isCurrent) {
          setFetched({ status: 'ready', preset });
        }
      },
      (error: unknown) => {
        if (!isCurrent) {
          return;
        }
        // A malformed id is rejected as a validation error; it is just as missing.
        const isMissing = error instanceof ApiError && (error.status === 404 || error.code === 'validation_error');
        setFetched(
          isMissing
            ? { status: 'notFound' }
            : { status: 'failed', message: error instanceof ApiError ? error.message : String(error) }
        );
      }
    );
    return () => {
      isCurrent = false;
    };
  }, [presetId, isInList, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  let state: PresetRecordState;
  if (!presetId) {
    state = { status: 'none' };
  } else if (fromList) {
    state = { status: 'ready', preset: fromList };
  } else {
    state = fetched;
  }
  return { state, retry };
}
