import { useRef, type KeyboardEvent } from 'react';
import clsx from 'clsx';
import type { PresetFieldType } from '@/types';
import { PRESET_RULE_TEXT, PRESET_TYPE_META, PRESET_TYPES } from '../constants/preset-library.constants';
import styles from './PresetLibrary.module.css';

/** The type with its icon, as a small label. */
export function PresetTypeChip({ type }: { type: PresetFieldType }) {
  const { icon: Icon, label } = PRESET_TYPE_META[type];
  return (
    <span className={styles.typeChip}>
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}

/** Plain-language rule chips, e.g. "kg", "0 to 300". */
export function RuleChips({ chips }: { chips: string[] }) {
  if (!chips.length) {
    return <span className={clsx(styles.chip, styles.chipMuted)}>{PRESET_RULE_TEXT.none}</span>;
  }
  return (
    <span className={styles.chips}>
      {chips.map((chip) => (
        <span key={chip} className={styles.chip}>
          {chip}
        </span>
      ))}
    </span>
  );
}

const NEXT_KEYS: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/** Arrow keys move the choice within a radio group, as with native radio buttons. */
function useRovingRadio<T extends string>(items: readonly T[], value: T, onChange: (next: T) => void) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (event: KeyboardEvent) => {
    const step = NEXT_KEYS[event.key];
    if (!step) {
      return;
    }
    event.preventDefault();
    const next = (items.indexOf(value) + step + items.length) % items.length;
    onChange(items[next]);
    refs.current[next]?.focus();
  };
  const refAt = (index: number) => (el: HTMLButtonElement | null) => {
    refs.current[index] = el;
  };
  return { onKeyDown, refAt };
}

interface TypePickerProps {
  value: PresetFieldType;
  onChange: (next: PresetFieldType) => void;
  labelledBy: string;
}

/** Field type as a grid of cards: icon, name and when to use it. */
export function PresetTypePicker({ value, onChange, labelledBy }: TypePickerProps) {
  const { onKeyDown, refAt } = useRovingRadio(PRESET_TYPES, value, onChange);
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className={styles.typeGrid}>
      {PRESET_TYPES.map((type, index) => {
        const { icon: Icon, label, hint } = PRESET_TYPE_META[type];
        const isActive = type === value;
        return (
          <button
            key={type}
            ref={refAt(index)}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            className={clsx(styles.typeCard, isActive && styles.typeCardActive)}
            onClick={() => onChange(type)}
            onKeyDown={onKeyDown}
          >
            <Icon className={styles.typeIcon} aria-hidden />
            <span className={styles.typeName}>{label}</span>
            <span className={styles.typeHint}>{hint}</span>
          </button>
        );
      })}
    </div>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
  labelledBy: string;
}

/** A few mutually exclusive choices side by side. */
export function Segmented<T extends string>({ value, options, onChange, labelledBy }: SegmentedProps<T>) {
  const { onKeyDown, refAt } = useRovingRadio(
    options.map((o) => o.value),
    value,
    onChange
  );
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className={styles.segmented}>
      {options.map((option, index) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            ref={refAt(index)}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            className={clsx(styles.segment, isActive && styles.segmentActive)}
            onClick={() => onChange(option.value)}
            onKeyDown={onKeyDown}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

interface TogglePillsProps {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (next: string[]) => void;
  labelledBy?: string;
}

/** Several choices that can each be on or off, kept in the options' order. */
export function TogglePills({ options, value, onChange, labelledBy }: TogglePillsProps) {
  const toggle = (option: string) => {
    const next = value.includes(option) ? value.filter((v) => v !== option) : [...value, option];
    onChange(options.map((o) => o.value).filter((v) => next.includes(v)));
  };
  return (
    <div role="group" aria-labelledby={labelledBy} className={styles.pills}>
      {options.map((option) => {
        const isOn = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isOn}
            className={clsx(styles.pill, isOn && styles.pillActive)}
            onClick={() => toggle(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
