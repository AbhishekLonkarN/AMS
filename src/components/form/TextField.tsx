import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import type { FieldChromeProps } from './form.types';
import { FormField } from './FormField';

type TextFieldProps = FieldChromeProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'children'>;

/** Labelled input. Spread `register('name')` onto it. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, isRequired, isFullWidth, id, className, ...inputProps },
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
        {...inputProps}
      />
    </FormField>
  );
});
