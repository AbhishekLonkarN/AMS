import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import clsx from 'clsx';
import type { FieldChromeProps, SelectOption } from './form.types';
import { FORM_LABELS } from './form.constants';
import { FormField } from './FormField';

type SelectFieldProps = FieldChromeProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
    options: SelectOption[];
    /** Renders an empty first option. Pass `false` to omit. */
    placeholder?: string | false;
  };

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, hint, error, isRequired, isFullWidth, id, className, options, placeholder = FORM_LABELS.selectPlaceholder, ...selectProps },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <FormField label={label} hint={hint} error={error} isRequired={isRequired} isFullWidth={isFullWidth} htmlFor={selectId}>
      <select
        ref={ref}
        id={selectId}
        className={clsx('select w-full', error && 'select-error', className)}
        aria-invalid={!!error}
        aria-required={isRequired}
        aria-describedby={error || hint ? `${selectId}-message` : undefined}
        {...selectProps}
      >
        {placeholder !== false && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.isDisabled}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
});
