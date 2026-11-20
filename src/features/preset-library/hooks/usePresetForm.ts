import { useEffect, useMemo, useRef } from 'react';
import { useBlocker } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Preset, PresetFieldType, PresetOption } from '@/types';
import { OVERLAY_TRANSITION_MS } from '@/components/overlay';
import { notify, usePresetsStore } from '@/store';
import { isSameText } from '@/utils/string.utils';
import { PRESET_LABELS as L } from '../constants/preset-library.constants';
import { buildPresetSchema, type PresetFormValues } from '../schemas/preset.schema';
import { errorMessage, fieldProblems } from '../utils/preset-errors.utils';
import { EMPTY_PRESET_VALUES, switchType, toFormValues, toPresetInput } from '../utils/preset-form.utils';

export type PresetFormMode = 'create' | 'edit' | 'duplicate';

interface PresetFormOptions {
  mode: PresetFormMode;
  /** Edit: the pre-set being changed. Duplicate: the one being copied. */
  source?: Preset;
  /** Called after a successful save with the saved pre-set (the drawer then shows it). */
  onSaved: (saved: Preset) => void;
}

/** The fields each part of the form owns, so the first error can be scrolled into view. */
const FIELD_ORDER: (keyof PresetFormValues)[] = [
  'title',
  'description',
  'fieldTitle',
  'instructions',
  'options',
  'unit',
  'decimalPlaces',
  'minValue',
  'maxValue',
  'minLength',
  'maxLength',
  'minDate',
  'maxDate',
  'defaultValue',
  'defaultValues',
];

const initialValues = (mode: PresetFormMode, source?: Preset): PresetFormValues => {
  if (!source) {
    return EMPTY_PRESET_VALUES;
  }
  return mode === 'duplicate' ? toFormValues(source, { title: `${source.title} ${L.copySuffix}` }) : toFormValues(source);
};

export function usePresetForm({ mode, source, onSaved }: PresetFormOptions) {
  const presets = usePresetsStore((s) => s.presets);
  const { add, update } = usePresetsStore.getState();
  const editingId = mode === 'edit' ? source?.id : undefined;

  // An early hint only; the backend has the final say on unique titles.
  const presetsRef = useRef(presets);
  presetsRef.current = presets;
  const schema = useMemo(
    () => buildPresetSchema((title) => presetsRef.current.some((p) => p.id !== editingId && isSameText(p.title, title))),
    [editingId]
  );

  const form = useForm<PresetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues(mode, source),
    // Errors clear as soon as they are fixed, not only on the next submit.
    mode: 'onTouched',
  });
  const { formState, setValue, getValues, watch, reset } = form;
  const values = watch();

  // Focus the title once the drawer has finished sliding in: focusing inside the still
  // off-screen panel makes the browser scroll it into view and breaks the slide animation.
  // A duplicate's title is preselected so typing replaces the "(copy)" name straight away.
  useEffect(() => {
    if (mode === 'edit') {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('[data-field="title"] input');
      input?.focus({ preventScroll: true });
      if (mode === 'duplicate') {
        input?.select();
      }
    }, OVERLAY_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [mode]);

  const isSavingRef = useRef(false);
  const isDirty = formState.isDirty;
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && !isSavingRef.current && currentLocation.pathname !== nextLocation.pathname
  );

  const handleTypeChange = (next: PresetFieldType) => {
    reset(switchType(getValues(), next), { keepDefaultValues: true, keepErrors: false, keepTouched: true });
  };

  /**
   * Option values follow their labels, so renaming an option changes its value. The default
   * follows along: renamed options keep it (by position), removed ones drop out of it.
   */
  const handleOptionsChange = (next: PresetOption[]) => {
    const prev = getValues('options');
    const isRemoval = next.length < prev.length;
    const remap = (value: string) => {
      if (isRemoval) {
        return next.some((o) => o.value === value) ? value : undefined;
      }
      const index = prev.findIndex((o) => o.value === value);
      return index === -1 ? undefined : next[index]?.value;
    };
    setValue('options', next, { shouldDirty: true, shouldValidate: formState.isSubmitted });
    const single = getValues('defaultValue');
    if (single) {
      setValue('defaultValue', remap(single) ?? '', { shouldDirty: true });
    }
    const many = getValues('defaultValues');
    if (many.length) {
      setValue('defaultValues', many.map(remap).filter((v): v is string => !!v), { shouldDirty: true });
    }
  };

  /** Most pre-sets use the title as the field's label too, so it is offered once. */
  const handleTitleBlur = () => {
    const { title, fieldTitle } = getValues();
    if (title.trim() && !fieldTitle.trim()) {
      setValue('fieldTitle', title.trim(), { shouldDirty: true });
    }
  };

  const scrollToFirstError = () => {
    const first = FIELD_ORDER.find((name) => form.getFieldState(name).error);
    if (first) {
      document.querySelector(`[data-field="${first}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      form.setFocus(first);
    }
  };

  const handleSubmit = form.handleSubmit(async (submitted) => {
    const input = toPresetInput(submitted);
    try {
      const saved = mode === 'edit' && source ? await update(source.id, input) : await add(input);
      notify.success(mode === 'edit' ? L.saved(saved.title) : L.created(saved.title));
      isSavingRef.current = true;
      reset(toFormValues(saved));
      onSaved(saved);
    } catch (error) {
      const problems = fieldProblems(error, submitted.type);
      if (problems.length) {
        problems.forEach(({ path, message }) => form.setError(path, { type: 'server', message }));
        scrollToFirstError();
      } else {
        notify.error(errorMessage(error));
      }
    }
  }, scrollToFirstError);

  return {
    mode,
    form,
    values,
    errors: formState.errors,
    isSubmitting: formState.isSubmitting,
    isDirty,
    handleTypeChange,
    handleOptionsChange,
    handleTitleBlur,
    handleSubmit,
    leaveConfirm: {
      isOpen: blocker.state === 'blocked',
      onConfirm: () => blocker.proceed?.(),
      onCancel: () => blocker.reset?.(),
    },
  };
}

export type PresetFormModel = ReturnType<typeof usePresetForm>;
