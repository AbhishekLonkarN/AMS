import { useId, type CSSProperties } from 'react';
import { get, useForm, useFormContext, type UseFormReturn } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { FormField, SelectField, TextAreaField, TextField } from '@/components/form';
import { Tooltip } from '@/components/overlay';
import type {
  FieldConfig,
  FormBuilderConfig,
  LookupResolver,
  SectionConfig,
} from './dynamic-form.types';
import { DEFAULT_FIELD_WIDTH, DYNAMIC_FORM_LABELS as L } from './dynamic-form.constants';
import styles from './DynamicForm.module.css';

/** A field by position: config.sections[sectionIndex].fields[fieldIndex]. */
export interface FieldPosition {
  sectionIndex: number;
  fieldIndex: number;
}

interface DynamicFormProps {
  config: FormBuilderConfig;
  /** Every control disabled (the builder's live preview). */
  preview?: boolean;
  /** Prepended to each field name: answers land at [...namePrefix, sectionKey, fieldKey]. */
  namePrefix?: string[];
  /** Options for `lookup` fields. */
  resolveLookup?: LookupResolver;
  /** Preview only: makes each field clickable (e.g. to open it in an editor). */
  onFieldSelect?: (position: FieldPosition) => void;
  /** Preview only: reports the field under the pointer / focus (null when it leaves). */
  onFieldHover?: (position: FieldPosition | null) => void;
  /** Preview only: outlines this field. */
  activeField?: FieldPosition | null;
}

/** Native input type per text-like field type; anything unknown falls back to plain text. */
const INPUT_TYPES: Partial<Record<string, string>> = {
  text: 'text',
  number: 'number',
  currency: 'number',
  phone: 'tel',
  email: 'email',
  date: 'date',
  datetime: 'datetime-local',
};

/**
 * Renders a saved form config. Inside a react-hook-form <FormProvider> it registers into
 * that form; on its own (e.g. a preview) it keeps answers in a private form.
 */
export function DynamicForm({
  config,
  preview = false,
  namePrefix = [],
  resolveLookup,
  onFieldSelect,
  onFieldHover,
  activeField,
}: DynamicFormProps) {
  // useFormContext returns null outside a provider; the private form is the fallback.
  const context = useFormContext() as UseFormReturn | null;
  const ownForm = useForm();
  const form = context ?? ownForm;

  return (
    <div className={styles.form}>
      {config.sections.map((section, index) => (
        <SectionCard
          key={section.uid ?? `${section.key}-${index}`}
          section={section}
          sectionIndex={index}
          form={form}
          preview={preview}
          namePrefix={namePrefix}
          resolveLookup={resolveLookup}
          onFieldSelect={preview ? onFieldSelect : undefined}
          onFieldHover={preview ? onFieldHover : undefined}
          activeFieldIndex={
            activeField?.sectionIndex === index ? activeField.fieldIndex : undefined
          }
        />
      ))}
    </div>
  );
}

interface SectionCardProps {
  section: SectionConfig;
  sectionIndex: number;
  form: UseFormReturn;
  preview: boolean;
  namePrefix: string[];
  resolveLookup?: LookupResolver;
  onFieldSelect?: (position: FieldPosition) => void;
  onFieldHover?: (position: FieldPosition | null) => void;
  activeFieldIndex?: number;
}

function SectionCard({
  section,
  sectionIndex,
  form,
  preview,
  namePrefix,
  resolveLookup,
  onFieldSelect,
  onFieldHover,
  activeFieldIndex,
}: SectionCardProps) {
  const fields = (
    <div className={styles.grid}>
      {section.fields.map((field, fieldIndex) => {
        const position = { sectionIndex, fieldIndex };
        return (
          <div
            key={field.uid ?? `${field.key}-${fieldIndex}`}
            className={clsx(styles.cell, activeFieldIndex === fieldIndex && styles.cellActive)}
            // Only the column span is inline; the grid and the narrow-screen fallback live in the CSS.
            style={{ '--span': clampWidth(field.width) } as CSSProperties}
          >
            <DynamicField
              field={field}
              name={[...namePrefix, section.key, field.key].join('.')}
              form={form}
              preview={preview}
              resolveLookup={resolveLookup}
            />
            {/* Disabled controls swallow clicks, so a transparent button over the cell takes them. */}
            {onFieldSelect && (
              <Tooltip content={L.editFieldTip}>
                <button
                  type="button"
                  className={styles.cellHit}
                  aria-label={L.editField(field.label.trim() || L.untitledField)}
                  onClick={() => onFieldSelect(position)}
                  onMouseEnter={() => onFieldHover?.(position)}
                  onMouseLeave={() => onFieldHover?.(null)}
                  onFocus={() => onFieldHover?.(position)}
                  onBlur={() => onFieldHover?.(null)}
                />
              </Tooltip>
            )}
          </div>
        );
      })}
    </div>
  );

  const heading = (
    <div className={styles.heading}>
      <h3 className={styles.title}>{section.title}</h3>
      {section.description && <p className={styles.description}>{section.description}</p>}
    </div>
  );

  if (section.collapsible) {
    return (
      <details open className={styles.card}>
        <summary className={styles.summary}>
          {heading}
          <ChevronDown className={styles.chevron} aria-hidden />
        </summary>
        {fields}
      </details>
    );
  }

  return (
    <section className={styles.card}>
      {heading}
      {fields}
    </section>
  );
}

interface DynamicFieldProps {
  field: FieldConfig;
  name: string;
  form: UseFormReturn;
  preview: boolean;
  resolveLookup?: LookupResolver;
}

function DynamicField({ field, name, form, preview, resolveLookup }: DynamicFieldProps) {
  const inputId = useId();
  const label = field.label.trim() || L.untitledField;
  const isRequired = !!field.required;
  const error = (get(form.formState.errors, name) as { message?: string } | undefined)?.message;
  const register = () =>
    form.register(name, {
      required: isRequired ? L.required(label) : false,
      disabled: preview,
    });
  const chrome = { label, isRequired, error };
  const placeholder = field.placeholder || undefined;

  switch (field.type) {
    case 'textarea':
    case 'address':
      return <TextAreaField {...chrome} placeholder={placeholder} {...register()} />;

    case 'select':
    case 'lookup': {
      const options =
        field.type === 'select'
          ? (field.options ?? [])
          : (resolveLookup?.(field.source ?? '') ?? []);
      return (
        <SelectField
          {...chrome}
          options={options}
          hint={options.length ? undefined : field.type === 'select' ? L.noOptions : L.noSource}
          {...register()}
          disabled={preview}
        />
      );
    }

    case 'multiselect': {
      const options = field.options ?? [];
      return (
        <FormField {...chrome} hint={options.length ? undefined : L.noOptions}>
          <div className={styles.choices}>
            {options.map((option) => (
              <label key={option.value} className={styles.choice}>
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  value={option.value}
                  {...register()}
                />
                {option.label}
              </label>
            ))}
          </div>
        </FormField>
      );
    }

    case 'checkbox':
      return (
        <FormField label="" error={error}>
          <label className={styles.choice}>
            <input type="checkbox" className="checkbox checkbox-sm" {...register()} />
            {label}
            {isRequired && <span className="text-error">*</span>}
          </label>
        </FormField>
      );

    case 'file':
      return (
        <FormField {...chrome} htmlFor={inputId}>
          <input id={inputId} type="file" className="file-input w-full" {...register()} />
        </FormField>
      );

    case 'auto':
      // Nothing to answer: the value is generated, so it is not registered.
      return <TextField label={label} value={L.autoValue} hint={L.autoHint} readOnly disabled />;

    default:
      return (
        <TextField
          {...chrome}
          type={INPUT_TYPES[field.type] ?? 'text'}
          step={field.type === 'currency' ? '0.01' : undefined}
          placeholder={placeholder}
          {...register()}
        />
      );
  }
}

const clampWidth = (width?: number) =>
  Math.min(24, Math.max(1, Math.round(width ?? DEFAULT_FIELD_WIDTH)));
