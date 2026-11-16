import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import type { FieldChromeProps } from './form.types';
import { FormField } from './FormField';
import { requiredPlaceholder } from './form.utils';

type TextFieldProps = FieldChromeProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'children'>;

/** Labelled input. Spread `register('name')` onto it. A required field shows "Enter <label>" as its hint unless a placeholder is given. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, isRequired, isFullWidth, id, className, placeholder, ...inputProps },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FormField label={label} hint={hint} error={error} isRequired={isRequired} isFullWidth={isFullWidth} htmlFor={inputId}>
      <input
        ref={ref}
        id={inputId}
        className={clsx('input w-full', error && 'input-error', className)}
        aria-invalid={!!error}
        aria-required={isRequired}
        aria-describedby={error || hint ? `${inputId}-message` : undefined}
        placeholder={placeholder ?? (isRequired ? requiredPlaceholder(label) : undefined)}
        {...inputProps}
      />
    </FormField>
  );
});
