import { useCallback, useEffect, useState } from 'react';
import type { EcrfDesign, EcrfTemplate } from '@/types';
import { ApiError, getEcrfTemplate, getEcrfTemplateDesign } from '@/api';

export type EcrfFormMode = 'create' | 'edit';

type EditorState =
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'failed'; message: string }
  | { status: 'ready'; template?: EcrfTemplate; design?: EcrfDesign };

/** For Edit, fetches the template and the design version being worked on. Create needs nothing. */
export function useEcrfTemplateEditor(mode: EcrfFormMode, templateId?: string) {
  const [state, setState] = useState<EditorState>(() =>
    mode === 'create' ? { status: 'ready' } : { status: 'loading' }
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (mode === 'create') {
      return undefined;
    }
    if (!templateId) {
      setState({ status: 'notFound' });
      return undefined;
    }
    let isCurrent = true;
    setState({ status: 'loading' });
    Promise.all([getEcrfTemplate(templateId), getEcrfTemplateDesign(templateId)]).then(
      ([template, design]) => {
        if (isCurrent) {
          setState({ status: 'ready', template, design });
        }
      },
      (error: unknown) => {
        if (!isCurrent) {
          return;
        }
        // A malformed id is rejected as a validation error; it is just as missing.
        const isMissing =
          error instanceof ApiError && (error.status === 404 || error.code === 'validation_error');
        setState(
          isMissing
            ? { status: 'notFound' }
            : { status: 'failed', message: error instanceof ApiError ? error.message : String(error) }
        );
      }
    );
    return () => {
      isCurrent = false;
    };
  }, [mode, templateId, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { state, retry };
}
