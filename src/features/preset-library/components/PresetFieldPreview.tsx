import { useId, useState } from 'react';
import { CircleAlert, CircleCheck, Eye, Info } from 'lucide-react';
import clsx from 'clsx';
import type { PresetDefaultValue } from '@/types';
import { CHOICE_TYPES, MULTI_VALUE_TYPES, PRESET_LABELS as L } from '../constants/preset-library.constants';
import { checkAnswer, hasRules, ruleSummary, type PresetRules } from '../utils/preset-rules.utils';
import { PresetTypeChip, RuleChips, TogglePills } from './PresetBits';
import styles from './PresetLibrary.module.css';

interface PresetFieldPreviewProps {
  rules: PresetRules;
  fieldTitle: string;
  instructions?: string;
  defaultValue?: PresetDefaultValue;
  /** Shown above the card (the form's "Live preview"); omit for an untitled card. */
  title?: string;
}

const initialAnswer = (rules: PresetRules, value?: PresetDefaultValue): string | string[] => {
  if (MULTI_VALUE_TYPES.has(rules.type)) {
    return Array.isArray(value) ? value : [];
  }
  return value === undefined || Array.isArray(value) ? '' : String(value);
};

/**
 * The field as it appears on a form, filled with its default. Typing a value checks it
 * against the rules right away, so the rules can be tried before saving.
 * Remount it (via `key`) when the type or default changes, to start from the new default.
 */
export function PresetFieldPreview({ rules, fieldTitle, instructions, defaultValue, title = L.previewTitle }: PresetFieldPreviewProps) {
  const id = useId();
  const [answer, setAnswer] = useState(() => initialAnswer(rules, defaultValue));
  const label = fieldTitle.trim() || L.previewUntitled;
  const options = rules.options.filter((o) => o.label.trim());
  const isBlank = Array.isArray(answer) ? !answer.length : !answer.trim();
  const problem = isBlank ? null : checkAnswer(rules, answer);
  const v = rules.validation;
  const single = Array.isArray(answer) ? '' : answer;

  const control = () => {
    switch (rules.type) {
      case 'LONG_TEXT':
        return (
          <textarea id={id} rows={3} className="textarea w-full" value={single} maxLength={v.maxLength} onChange={(e) => setAnswer(e.target.value)} />
        );
      case 'NUMERIC':
        return (
          <div className={styles.inputWithUnit}>
            <input id={id} className="input w-full" inputMode="decimal" value={single} onChange={(e) => setAnswer(e.target.value)} />
            {rules.unit && <span className={styles.unit}>{rules.unit}</span>}
          </div>
        );
      case 'DATE':
        return (
          <input id={id} type="date" className="input w-full" value={single} min={v.minDate} max={v.maxDate} onChange={(e) => setAnswer(e.target.value)} />
        );
      case 'DROPDOWN':
        return (
          <select id={id} className="select w-full" value={single} onChange={(e) => setAnswer(e.target.value)}>
            <option value="">{L.previewSelect}</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        );
      case 'RADIO':
        return (
          <div role="radiogroup" aria-labelledby={`${id}-label`} className={styles.choiceList}>
            {options.map((o) => (
              <label key={o.value} className={styles.choice}>
                <input type="radio" className="radio radio-sm" name={id} checked={single === o.value} onChange={() => setAnswer(o.value)} />
                {o.label}
              </label>
            ))}
          </div>
        );
      case 'CHECKBOX': {
        const ticked = Array.isArray(answer) ? answer : [];
        return (
          <div role="group" aria-labelledby={`${id}-label`} className={styles.choiceList}>
            {options.map((o) => (
              <label key={o.value} className={styles.choice}>
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={ticked.includes(o.value)}
                  onChange={(e) => setAnswer(e.target.checked ? [...ticked, o.value] : ticked.filter((x) => x !== o.value))}
                />
                {o.label}
              </label>
            ))}
          </div>
        );
      }
      case 'MULTI_SELECT':
        return <TogglePills options={options} value={Array.isArray(answer) ? answer : []} onChange={setAnswer} labelledBy={`${id}-label`} />;
      default:
        return <input id={id} className="input w-full" value={single} maxLength={v.maxLength} onChange={(e) => setAnswer(e.target.value)} />;
    }
  };

  const isChoice = CHOICE_TYPES.has(rules.type);

  let status: { tone: 'ok' | 'error' | 'idle'; text: string };
  if (problem) {
    status = { tone: 'error', text: problem };
  } else if (!isBlank) {
    status = { tone: 'ok', text: L.previewValid };
  } else {
    status = { tone: 'idle', text: hasRules(rules) ? L.previewEmpty : L.previewNoRules };
  }
  const StatusIcon = status.tone === 'ok' ? CircleCheck : status.tone === 'error' ? CircleAlert : Info;

  return (
    <section className={styles.preview} aria-label={title}>
      <div className={styles.previewHeader}>
        <span className={styles.previewTitle}>
          <Eye className="size-4" aria-hidden /> {title}
        </span>
        <PresetTypeChip type={rules.type} />
      </div>

      <div className={styles.previewBody}>
        <label id={`${id}-label`} htmlFor={id} className={styles.previewLabel}>
          {label}
        </label>
        {isChoice && !options.length ? <p className={styles.emptyChoices}>{L.previewNoOptions}</p> : control()}
        {instructions?.trim() && <p className={styles.previewInstructions}>{instructions}</p>}
      </div>

      {/* Announced as the user types, so screen-reader users hear the result too. */}
      <p
        role="status"
        className={clsx(
          styles.status,
          status.tone === 'ok' && styles.statusOk,
          status.tone === 'error' && styles.statusError,
          status.tone === 'idle' && styles.statusIdle
        )}
      >
        <StatusIcon className={styles.statusIcon} aria-hidden />
        {status.text}
      </p>

      <RuleChips chips={ruleSummary(rules)} />
    </section>
  );
}
