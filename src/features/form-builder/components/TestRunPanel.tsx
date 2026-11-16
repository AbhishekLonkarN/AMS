import { useState } from 'react';
import { FormProvider, useForm, type FieldErrors, type FieldValues } from 'react-hook-form';
import { CheckCircle2, CircleAlert, FlaskConical, RotateCcw } from 'lucide-react';
import {
  DynamicForm,
  type FormBuilderConfig,
  type LookupResolver,
} from '@/components/dynamic-form';
import { FORM_BUILDER_LABELS as L } from '../constants/form-builder.constants';
import styles from './FormBuilder.module.css';

interface TestRunPanelProps {
  config: FormBuilderConfig;
  resolveLookup?: LookupResolver;
}

type TestResult = { isPassed: true; json: string } | { isPassed: false; errorCount: number } | null;

/** Errors are nested by [sectionKey][fieldKey]; count the leaves that carry a message. */
function countErrors(errors: FieldErrors | Record<string, unknown>): number {
  return Object.values(errors).reduce<number>((sum, value) => {
    if (!value || typeof value !== 'object') {
      return sum;
    }
    return sum + ('message' in value ? 1 : countErrors(value as Record<string, unknown>));
  }, 0);
}

/** File inputs hold a FileList, which JSON shows as {}; show the chosen file names instead. */
const answerReplacer = (_key: string, value: unknown) =>
  typeof FileList !== 'undefined' && value instanceof FileList
    ? [...value].map((file) => file.name)
    : value;

/**
 * The designed form as a working form: the user fills it in and submits it to see the real
 * required-field messages and the exact answers JSON, before the eCRF is ever used at a site.
 */
export function TestRunPanel({ config, resolveLookup }: TestRunPanelProps) {
  // Fields removed or renamed in the editor drop their test answers instead of lingering.
  const form = useForm({ shouldUnregister: true, mode: 'onSubmit' });
  const [result, setResult] = useState<TestResult>(null);

  const handleValid = (values: FieldValues) =>
    setResult({ isPassed: true, json: JSON.stringify(values, answerReplacer, 2) });
  const handleInvalid = (errors: FieldErrors) =>
    setResult({ isPassed: false, errorCount: countErrors(errors) });

  const handleReset = () => {
    form.reset({});
    setResult(null);
  };

  return (
    <FormProvider {...form}>
      <form
        noValidate
        className={styles.testForm}
        onSubmit={form.handleSubmit(handleValid, handleInvalid)}
      >
        <DynamicForm config={config} resolveLookup={resolveLookup} />

        <div className={styles.testActions}>
          <button type="submit" className="btn btn-secondary btn-sm">
            <FlaskConical className="size-4" aria-hidden /> {L.submitTest}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleReset}>
            <RotateCcw className="size-4" aria-hidden /> {L.resetTest}
          </button>
        </div>

        {result && (
          <div role="status" className={result.isPassed ? styles.testPassed : styles.testFailed}>
            {result.isPassed ? (
              <>
                <p className={styles.testMessage}>
                  <CheckCircle2 className="size-4 shrink-0" aria-hidden /> {L.testPassed}
                </p>
                <pre className={styles.testJson}>{result.json}</pre>
              </>
            ) : (
              <p className={styles.testMessage}>
                <CircleAlert className="size-4 shrink-0" aria-hidden />{' '}
                {L.testFailed(result.errorCount)}
              </p>
            )}
          </div>
        )}
      </form>
    </FormProvider>
  );
}
