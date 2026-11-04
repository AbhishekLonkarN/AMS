import { forwardRef, useId, useLayoutEffect, useRef, useState, type SelectHTMLAttributes } from 'react';
import type { FieldChromeProps, SelectOption } from './form.types';
import { FORM_LABELS } from './form.constants';
import { FormField } from './FormField';
import { DropdownSelect } from './DropdownSelect';

type SelectFieldProps = FieldChromeProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
    options: SelectOption[];
    /** Renders an empty first option. Pass `false` to omit. */
    placeholder?: string | false;
  };

/**
 * Labelled DropdownSelect with the same API as a native <select>, so it works with both
 * `{...register('x')}` and controlled `value` / `onChange(e)`. A hidden native <select>
 * holds the value for react-hook-form; the dropdown reads it and writes changes back to it.
 */
export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  {
    label,
    hint,
    error,
    isRequired,
    isFullWidth,
    id,
    className,
    options,
    placeholder = FORM_LABELS.selectPlaceholder,
    disabled,
    ...selectProps
  },
  ref,
) {
  const autoId = useId();
  const triggerId = id ?? autoId;
  const nativeRef = useRef<HTMLSelectElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [current, setCurrent] = useState('');

  // react-hook-form writes values (defaults, reset) straight to the native select without
  // re-rendering us through props; mirror whatever it holds after every render.
  useLayoutEffect(() => {
    const next = nativeRef.current?.value ?? '';
    if (next !== current) setCurrent(next);
  });

  const setNativeRef = (node: HTMLSelectElement | null) => {
    nativeRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const handleChange = (next: string) => {
    const select = nativeRef.current;
    if (!select) return;
    select.value = next;
    // A real change event, so register()'s onChange and controlled onChange(e) both fire.
    select.dispatchEvent(new Event('change', { bubbles: true }));
    setCurrent(select.value);
  };

  return (
    <FormField label={label} hint={hint} error={error} isRequired={isRequired} isFullWidth={isFullWidth} htmlFor={triggerId}>
      <DropdownSelect
        ref={triggerRef}
        id={triggerId}
        value={current}
        options={options}
        onChange={handleChange}
        emptyLabel={placeholder === false ? undefined : placeholder}
        isInvalid={!!error}
        isDisabled={disabled}
        isRequired={isRequired}
        describedBy={error || hint ? `${triggerId}-message` : undefined}
        className={className}
      />
      <select
        ref={setNativeRef}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        disabled={disabled}
        // react-hook-form focuses the first invalid field's ref; hand that focus to the dropdown.
        onFocus={() => triggerRef.current?.focus()}
        {...selectProps}
      >
        {placeholder !== false && <option value="" />}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.isDisabled} />
        ))}
      </select>
    </FormField>
  );
});
