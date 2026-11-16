import type { FormBuilderConfig } from '@/components/dynamic-form';
import type { EcrfTemplateFormValues } from '../schemas/ecrf-template.schema';

/** An unsaved edit, kept in this browser so a crash, reload or stray close doesn't lose it. */
export interface StoredEcrfDraft {
  savedAt: string;
  details: EcrfTemplateFormValues;
  /** The builder draft as-is, editor-only state included (unsaved keys must keep following labels). */
  draft: FormBuilderConfig;
}

const draftKey = (entityId: string) => `clintech:ecrf-draft:${entityId}`;

// Storage can be missing or blocked (private mode, disabled site data); the editor works without it.
export function readStoredDraft(entityId: string): StoredEcrfDraft | null {
  try {
    const raw = window.localStorage.getItem(draftKey(entityId));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as StoredEcrfDraft;
    return parsed && typeof parsed.savedAt === 'string' && parsed.draft && parsed.details
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export function writeStoredDraft(entityId: string, value: StoredEcrfDraft) {
  try {
    window.localStorage.setItem(draftKey(entityId), JSON.stringify(value));
  } catch {
    // Quota or access error: autosave is best effort.
  }
}

export function clearStoredDraft(entityId: string) {
  try {
    window.localStorage.removeItem(draftKey(entityId));
  } catch {
    // Nothing to clean up.
  }
}
