import { useRef } from 'react';
import { Plus, X } from 'lucide-react';
import clsx from 'clsx';
import type { FieldOption } from '@/components/dynamic-form';
import { FORM_BUILDER_LABELS as L } from '../constants/form-builder.constants';
import { optionValue } from '../utils/config.utils';
import { Tooltip } from '@/components/overlay';
import styles from './FormBuilder.module.css';

interface OptionsEditorProps {
  id: string;
  options: FieldOption[];
  onChange: (options: FieldOption[]) => void;
  isDisabled?: boolean;
  isInvalid?: boolean;
}

/** One label per row; each row's stored value is a slug of its label. */
export function OptionsEditor({
  id,
  options,
  onChange,
  isDisabled,
  isInvalid,
}: OptionsEditorProps) {
  // Synthetic row ids: keyed by index or value, editing / removing a middle row would remount
  // the rows below it and drop the focus of whoever is typing.
  const rowIds = useRef<string[]>([]);
  const nextRowId = useRef(0);
  while (rowIds.current.length < options.length) {
    rowIds.current.push(`row-${nextRowId.current++}`);
  }
  rowIds.current.length = options.length;

  const handleLabelChange = (index: number, label: string) => {
    const others = options.filter((_, i) => i !== index).map((o) => o.value);
    onChange(
      options.map((o, i) =>
        i === index ? { ...o, label, value: optionValue(label, o.value, index, others) } : o
      )
    );
  };

  const handleRemove = (index: number) => {
    rowIds.current.splice(index, 1);
    onChange(options.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    const others = options.map((o) => o.value);
    onChange([
      ...options,
      { label: '', value: optionValue('', undefined, options.length, others) },
    ]);
  };

  return (
    <div className={styles.options}>
      <ul className={styles.optionList} aria-labelledby={`${id}-label`}>
        {options.map((option, index) => {
          const name = option.label || L.optionPlaceholder(index + 1);
          return (
            <li key={rowIds.current[index]} className={styles.optionRow}>
              <input
                id={index === 0 ? id : undefined}
                className={clsx('input input-sm w-full', isInvalid && 'input-error')}
                value={option.label}
                placeholder={L.optionPlaceholder(index + 1)}
                aria-label={name}
                disabled={isDisabled}
                onChange={(e) => handleLabelChange(index, e.target.value)}
              />
              <Tooltip content={L.tips.removeOption}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-square"
                  aria-label={L.removeOption(name)}
                  disabled={isDisabled}
                  onClick={() => handleRemove(index)}
                >
                  <X className="size-4" aria-hidden />
                </button>
              </Tooltip>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className="btn btn-ghost btn-xs self-start"
        disabled={isDisabled}
        onClick={handleAdd}
      >
        <Plus className="size-3.5" aria-hidden /> {L.addOption}
      </button>
    </div>
  );
}
