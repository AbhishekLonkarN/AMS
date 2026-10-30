import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';
import type { FieldChromeProps } from './form.types';
import { FormField } from './FormField';

type TextAreaFieldProps = FieldChromeProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'>;

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(function TextAreaField(
  { label, hint, error, isRequired, isFullWidth, id, className, rows = 3, ...textareaProps },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FormField label={label} hint={hint} error={error} isRequired={isRequired} isFullWidth={isFullWidth} htmlFor={inputId}>
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={clsx('textarea w-full', error && 'textarea-error', className)}
        aria-invalid={!!error}
        aria-required={isRequired}
        aria-describedby={error || hint ? `${inputId}-message` : undefined}
        {...textareaProps}
      />
    </FormField>
  );
});
