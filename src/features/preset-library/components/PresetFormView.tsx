import { useId } from 'react';
import { Info } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { DropdownSelect, FormField, TextAreaField, TextField } from '@/components/form';
import { DrawerActions, DrawerPanel, DrawerSection } from '@/components/overlay';
import { ConfirmDialog } from '@/components/feedback';
import { OptionsEditor } from '@/features/form-builder';
import type { PresetCharSet } from '@/types';
import {
  CHAR_SET_LABELS,
  CHAR_SETS,
  CHOICE_TYPES,
  MULTI_VALUE_TYPES,
  PRESET_FIELDS as F,
  PRESET_LABELS as L,
  PRESET_LIMITS,
  TEXT_TYPES,
} from '../constants/preset-library.constants';
import type { PresetFormModel } from '../hooks/usePresetForm';
import { toPresetInput } from '../utils/preset-form.utils';
import { PresetFieldPreview } from './PresetFieldPreview';
import { PresetTypePicker, Segmented, TogglePills } from './PresetBits';
import styles from './PresetLibrary.module.css';

const TITLES = { create: L.createTitle, edit: L.editTitle, duplicate: L.duplicateTitle } as const;
const SUBTITLES = { create: L.createDescription, edit: undefined, duplicate: L.duplicateDescription } as const;
const CHAR_SET_OPTIONS = CHAR_SETS.map((value: PresetCharSet) => ({ value, label: CHAR_SET_LABELS[value] }));

interface PresetFormViewProps {
  model: PresetFormModel;
  /** Edit only: the pre-set's current title, under the drawer title. */
  currentTitle?: string;
}

/** Add / Edit / Duplicate drawer: settings on the left, a live preview on the right. */
export function PresetFormView({ model, currentTitle }: PresetFormViewProps) {
  const id = useId();
  const { form, values, errors, mode } = model;
  const { register, control } = form;
  const { type } = values;
  const isChoice = CHOICE_TYPES.has(type);
  const isMulti = MULTI_VALUE_TYPES.has(type);
  const rules = toPresetInput(values);
  const namedOptions = values.options.filter((o) => o.label.trim());
  const { onBlur: titleOnBlur, ...titleField } = register('title');

  return (
    <DrawerPanel
      title={TITLES[mode]}
      subtitle={mode === 'edit' ? currentTitle : SUBTITLES[mode]}
      footer={
        <DrawerActions
          formId={`${id}-form`}
          primaryLabel={mode === 'edit' ? L.submitEdit : L.submitCreate}
          isBusy={model.isSubmitting}
        />
      }
    >
      {mode === 'edit' && (
        <p className={styles.notice}>
          <Info className="mt-0.5 size-4 shrink-0 text-accent-700" aria-hidden />
          {L.editHint}
        </p>
      )}

      <div className={styles.layout}>
        <form id={`${id}-form`} noValidate className={styles.formColumn} onSubmit={model.handleSubmit}>
          <DrawerSection title={L.sectionEntry} description={L.sectionEntryHint}>
            <div className="form-grid">
              <div data-field="title" className="md:col-span-2">
                <TextField
                  label={F.title}
                  isRequired
                  hint={F.titleHint}
                  maxLength={PRESET_LIMITS.title}
                  error={errors.title?.message}
                  {...titleField}
                  onBlur={(e) => {
                    void titleOnBlur(e);
                    model.handleTitleBlur();
                  }}
                />
              </div>
              <div data-field="description" className="md:col-span-2">
                <TextAreaField
                  label={F.description}
                  isRequired
                  rows={2}
                  hint={F.descriptionHint}
                  maxLength={PRESET_LIMITS.description}
                  error={errors.description?.message}
                  {...register('description')}
                />
              </div>
            </div>
          </DrawerSection>

          <DrawerSection title={L.sectionField} description={L.sectionFieldHint}>
            <div className="form-grid">
              <div data-field="fieldTitle" className="md:col-span-2">
                <TextField
                  label={F.fieldTitle}
                  isRequired
                  hint={F.fieldTitleHint}
                  maxLength={PRESET_LIMITS.fieldTitle}
                  error={errors.fieldTitle?.message}
                  {...register('fieldTitle')}
                />
              </div>
              <div data-field="instructions" className="md:col-span-2">
                <TextAreaField
                  label={F.instructions}
                  rows={2}
                  hint={F.instructionsHint}
                  maxLength={PRESET_LIMITS.instructions}
                  error={errors.instructions?.message}
                  {...register('instructions')}
                />
              </div>
            </div>
          </DrawerSection>

          <section className="flex shrink-0 flex-col gap-2">
            <div>
              <h3 id={`${id}-type`} className="text-body font-semibold text-base-content">
                {L.sectionType}
              </h3>
              <p className="text-label text-ink-500">{L.sectionTypeHint}</p>
            </div>
            <PresetTypePicker value={type} onChange={model.handleTypeChange} labelledBy={`${id}-type`} />
          </section>

          {isChoice && (
            <DrawerSection title={L.sectionOptions} description={L.sectionOptionsHint}>
              <div data-field="options">
                <FormField label={F.options} isRequired error={errors.options?.message} htmlFor={`${id}-options`}>
                  <OptionsEditor
                    id={`${id}-options`}
                    options={values.options}
                    onChange={model.handleOptionsChange}
                    isInvalid={!!errors.options}
                  />
                </FormField>
              </div>
            </DrawerSection>
          )}

          {type === 'NUMERIC' && (
            <DrawerSection title={L.sectionRules} description={L.sectionRulesHint}>
              <div className="form-grid">
                <div data-field="unit">
                  <TextField label={F.unit} hint={F.unitHint} maxLength={PRESET_LIMITS.unit} error={errors.unit?.message} {...register('unit')} />
                </div>
                <div data-field="decimalPlaces">
                  <TextField
                    label={F.decimalPlaces}
                    hint={F.decimalPlacesHint}
                    inputMode="numeric"
                    error={errors.decimalPlaces?.message}
                    {...register('decimalPlaces')}
                  />
                </div>
                <div data-field="minValue">
                  <TextField label={F.minValue} inputMode="decimal" error={errors.minValue?.message} {...register('minValue')} />
                </div>
                <div data-field="maxValue">
                  <TextField label={F.maxValue} inputMode="decimal" error={errors.maxValue?.message} {...register('maxValue')} />
                </div>
              </div>
            </DrawerSection>
          )}

          {TEXT_TYPES.has(type) && (
            <DrawerSection title={L.sectionRules} description={L.sectionRulesHint}>
              <div className="form-grid">
                <div data-field="minLength">
                  <TextField label={F.minLength} inputMode="numeric" error={errors.minLength?.message} {...register('minLength')} />
                </div>
                <div data-field="maxLength">
                  <TextField label={F.maxLength} inputMode="numeric" error={errors.maxLength?.message} {...register('maxLength')} />
                </div>
                <div className="md:col-span-2">
                  <FormField label={F.charSet}>
                    <span id={`${id}-charset`} className="sr-only">
                      {F.charSet}
                    </span>
                    <Controller
                      control={control}
                      name="charSet"
                      render={({ field }) => (
                        <Segmented value={field.value} options={CHAR_SET_OPTIONS} onChange={field.onChange} labelledBy={`${id}-charset`} />
                      )}
                    />
                  </FormField>
                </div>
              </div>
            </DrawerSection>
          )}

          {type === 'DATE' && (
            <DrawerSection title={L.sectionRules} description={L.sectionRulesHint}>
              <div className="form-grid">
                <div data-field="minDate">
                  <TextField label={F.minDate} type="date" error={errors.minDate?.message} {...register('minDate')} />
                </div>
                <div data-field="maxDate">
                  <TextField label={F.maxDate} type="date" error={errors.maxDate?.message} {...register('maxDate')} />
                </div>
              </div>
            </DrawerSection>
          )}

          <DrawerSection title={L.sectionDefault} description={L.sectionDefaultHint}>
            <div data-field={isMulti ? 'defaultValues' : 'defaultValue'}>
              {isMulti ? (
                <FormField label={F.defaultValue} error={errors.defaultValues?.message}>
                  <span id={`${id}-default`} className="sr-only">
                    {F.defaultValue}
                  </span>
                  {namedOptions.length ? (
                    <Controller
                      control={control}
                      name="defaultValues"
                      render={({ field }) => (
                        <TogglePills options={namedOptions} value={field.value} onChange={field.onChange} labelledBy={`${id}-default`} />
                      )}
                    />
                  ) : (
                    <p className="text-label italic text-ink-400">{L.previewNoOptions}</p>
                  )}
                </FormField>
              ) : isChoice ? (
                <FormField label={F.defaultValue} htmlFor={`${id}-default-select`} error={errors.defaultValue?.message}>
                  <Controller
                    control={control}
                    name="defaultValue"
                    render={({ field }) => (
                      <DropdownSelect
                        id={`${id}-default-select`}
                        value={field.value}
                        options={namedOptions}
                        emptyLabel={L.noDefault}
                        isInvalid={!!errors.defaultValue}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </FormField>
              ) : (
                <TextField
                  label={F.defaultValue}
                  type={type === 'DATE' ? 'date' : 'text'}
                  inputMode={type === 'NUMERIC' ? 'decimal' : undefined}
                  placeholder={L.noDefault}
                  error={errors.defaultValue?.message}
                  {...register('defaultValue')}
                />
              )}
            </div>
          </DrawerSection>
        </form>

        <aside className={styles.previewColumn}>
          <PresetFieldPreview
            // Starts over from the default whenever the type or the default changes.
            key={`${type}|${JSON.stringify(rules.defaultValue ?? null)}`}
            rules={rules}
            fieldTitle={values.fieldTitle}
            instructions={values.instructions}
            defaultValue={rules.defaultValue}
          />
        </aside>
      </div>

      <ConfirmDialog
        {...model.leaveConfirm}
        title={L.leaveTitle}
        message={L.leaveMessage}
        confirmLabel={L.leaveConfirm}
        cancelLabel={L.leaveCancel}
        tone="danger"
      />
    </DrawerPanel>
  );
}
