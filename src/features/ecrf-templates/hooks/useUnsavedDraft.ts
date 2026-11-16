import { useEffect, useRef, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import type { UseFormReturn } from 'react-hook-form';
import type { FormBuilderConfig } from '@/components/dynamic-form';
import { nowIso } from '@/utils/date.utils';
import type { EcrfTemplateFormValues } from '../schemas/ecrf-template.schema';
import {
  clearStoredDraft,
  readStoredDraft,
  writeStoredDraft,
  type StoredEcrfDraft,
} from '../utils/draft-storage.utils';

const AUTOSAVE_DELAY_MS = 600;

interface UnsavedDraftOptions {
  entityId: string;
  form: UseFormReturn<EcrfTemplateFormValues>;
  draft: FormBuilderConfig;
  setDraft: (next: FormBuilderConfig) => void;
  /** True once the draft differs from what was last saved. */
  isDirty: boolean;
}

/**
 * Two safety nets for a long design session:
 *  - leaving with unsaved changes (×, Esc, backdrop, Cancel, browser Back, tab close) asks first;
 *  - the work is autosaved in this browser and offered back the next time the template is opened.
 */
export function useUnsavedDraft({ entityId, form, draft, setDraft, isDirty }: UnsavedDraftOptions) {
  // Read once per template: the banner offers what was there when the drawer opened.
  const [recoverable, setRecoverable] = useState<StoredEcrfDraft | null>(() =>
    readStoredDraft(entityId)
  );
  const isSavingRef = useRef(false);
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  // Every close of the drawer is a navigation back to the list, so one blocker covers all of them.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirtyRef.current &&
      !isSavingRef.current &&
      currentLocation.pathname !== nextLocation.pathname
  );

  // Reload / tab close can't show our dialog; the browser's own prompt is the fallback.
  useEffect(() => {
    if (!isDirty) {
      return undefined;
    }
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Autosave, but not while an older draft is still on offer: it would be overwritten unseen.
  const details = form.watch();
  useEffect(() => {
    if (recoverable || isSavingRef.current) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      if (isDirtyRef.current) {
        writeStoredDraft(entityId, { savedAt: nowIso(), details: form.getValues(), draft });
      } else {
        clearStoredDraft(entityId);
      }
    }, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [entityId, draft, details, recoverable, form]);

  const restore = () => {
    if (!recoverable) {
      return;
    }
    setDraft(recoverable.draft);
    // keepDefaultValues: the restored values still count as unsaved changes.
    form.reset(recoverable.details, { keepDefaultValues: true });
    setRecoverable(null);
  };

  const dismissRecovery = () => {
    clearStoredDraft(entityId);
    setRecoverable(null);
  };

  /** Call right before a successful save closes the drawer. */
  const markSaved = () => {
    isSavingRef.current = true;
    clearStoredDraft(entityId);
  };

  return {
    recovery: recoverable && { savedAt: recoverable.savedAt, restore, dismiss: dismissRecovery },
    leaveConfirm: {
      isOpen: blocker.state === 'blocked',
      onConfirm: () => {
        clearStoredDraft(entityId);
        blocker.proceed?.();
      },
      onCancel: () => blocker.reset?.(),
    },
    markSaved,
  };
}
