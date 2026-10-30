import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import type { CheckState } from './permission-matrix.utils';

interface TriStateCheckboxProps {
  state: CheckState;
  label: string;
  onChange: (isChecked: boolean) => void;
  className?: string;
}

/** Checkbox showing all / some (indeterminate) / none, for select-all controls. */
export function TriStateCheckbox({ state, label, onChange, className }: TriStateCheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = state === 'some';
  }, [state]);
  return (
    <input
      ref={ref}
      type="checkbox"
      className={clsx('checkbox checkbox-xs checkbox-primary', className)}
      aria-label={label}
      checked={state === 'all'}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
}
