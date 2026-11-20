import { useId } from 'react';
import { ArrowDown, ArrowUp, ChevronRight, Copy, Info, RotateCcw, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import type { FieldConfig, FieldType } from '@/components/dynamic-form';
import {
  DropdownSelect,
  FORM_LABELS,
  FormField,
  TextField,
  type SelectOption,
} from '@/components/form';
import { Tooltip } from '@/components/overlay';
import {
  FIELD_TYPE_LABELS,
  FIELD_TYPE_OPTIONS,
  FORM_BUILDER_LABELS as L,
  OPTION_TYPES,
  PLACEHOLDER_TYPES,
} from '../constants/form-builder.constants';
import type { CatalogSection, IncompleteItem, KeyMode } from '../form-builder.types';
import { fieldKeyOptions } from '../utils/catalog.utils';
import { changeFieldType } from '../utils/config.utils';
import {
  effectiveFieldKey,
  followsLabel,
  isInheritedField,
  otherFieldKeys,
  resolveLabelBlurKey,
} from '../utils/key.utils';
import { OptionsEditor } from './OptionsEditor';
import styles from './FormBuilder.module.css';

const T = L.tips;

interface FieldEditorProps {
  field: FieldConfig;
  index: number;
  /** Every field of the section, this one included (for live keys and dedupe). */
  fields: FieldConfig[];
  domId: string;
  keyMode?: KeyMode;
  /** Set when Field Key is a catalog dropdown (edit mode). */
  catalogSection?: CatalogSection;
  hasCatalog: boolean;
  /** The validation problem on this field, if it is the one `validate()` stopped at. */
  invalid: IncompleteItem | null;
  lookupSources: SelectOption[];
  /** Field types offered in the Type dropdown. */
  typeOptions: SelectOption[];
  /** Only one card is expanded at a time; the rest show a one-line summary. */
  isOpen: boolean;
  /** Its field is hovered in the preview (or this card is hovered). */
  isLinked: boolean;
  /** Briefly highlighted after being opened from the preview or created. */
  isFlashing: boolean;
  onToggle: () => void;
  onHover: (isHovered: boolean) => void;
  onChange: (next: FieldConfig) => void;
  onLabelBlur: () => void;
  onKeyPick: (catalogKey: string) => void;
  onMove: (delta: -1 | 1) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onRevert: () => void;
}

export function FieldEditor({
  field,
  index,
  fields,
  domId,
  keyMode,
  catalogSection,
  hasCatalog,
  invalid,
  lookupSources,
  typeOptions,
  isOpen,
  isLinked,
  isFlashing,
  onToggle,
  onHover,
  onChange,
  onLabelBlur,
  onKeyPick,
  onMove,
  onDuplicate,
  onRemove,
  onRevert,
}: FieldEditorProps) {
  const idPrefix = useId();
  const name = field.label.trim() || L.untitledField;
  const isLocked = !!field.locked;
  const isTypeLocked = field.typeLocked ?? isLocked;
  const isFollowing = followsLabel(field);
  // While unsaved the box shows the key the label would produce; it is committed on blur.
  const liveKey = resolveLabelBlurKey(field, otherFieldKeys(fields, index));
  const shownKey = isFollowing ? liveKey : effectiveFieldKey(field);
  const isCatalogKey = hasCatalog && keyMode !== 'auto';
  const width = field.width ?? 24;
  // A type no longer offered is still shown (not silently blanked), so the user can see and change it.
  const shownTypeOptions =
    !field.type || typeOptions.some((o) => o.value === field.type)
      ? typeOptions
      : [...typeOptions, ...FIELD_TYPE_OPTIONS.filter((o) => o.value === field.type)];
  const errorFor =(...reasons: IncompleteItem['reason'][]) =>
    invalid && reasons.includes(invalid.reason) ? invalid.message : undefined;

  const update = (patch: Partial<FieldConfig>) => onChange({ ...field, ...patch });

  return (
    <article
      id={domId}
      data-flip-id={field.uid ?? `${field.key}:${index}`}
      className={clsx(
        styles.fieldCard,
        !isOpen && styles.fieldCardCollapsed,
        isLinked && styles.linked,
        isFlashing && styles.flash,
        invalid && styles.invalid
      )}
      aria-label={name}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <header className={styles.fieldHeader}>
        {/* The whole summary row toggles the card: label · type · required · width. */}
        <button
          type="button"
          className={styles.fieldToggle}
          aria-expanded={isOpen}
          aria-controls={`${idPrefix}-body`}
          aria-label={isOpen ? L.collapseFieldCard(name) : L.editFieldCard(name)}
          onClick={onToggle}
        >
          <ChevronRight
            className={clsx(styles.fieldChevron, isOpen && styles.fieldChevronOpen)}
            aria-hidden
          />
          <span className={styles.fieldIndex}>{index + 1}</span>
          <span className={styles.fieldName}>{name}</span>
          {field.type && (
            <span className={styles.typeBadge}>
              {FIELD_TYPE_LABELS[field.type as FieldType] ?? field.type}
            </span>
          )}
          {field.required && (
            <Tooltip content={T.required}>
              <span className={styles.requiredChip}>{L.requiredChip}</span>
            </Tooltip>
          )}
          <Tooltip content={T.width(width)}>
            <span className={styles.widthChip}>{L.widthChip(width)}</span>
          </Tooltip>
        </button>
        <div className={styles.headerActions}>
          {/* Disabled buttons get no pointer events, so the tip sits on a wrapper. */}
          <Tooltip content={T.moveUp}>
            <span className="inline-flex">
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-square"
                aria-label={L.moveUp(name)}
                disabled={index === 0}
                onClick={() => onMove(-1)}
              >
                <ArrowUp className="size-3.5" aria-hidden />
              </button>
            </span>
          </Tooltip>
          <Tooltip content={T.moveDown}>
            <span className="inline-flex">
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-square"
                aria-label={L.moveDown(name)}
                disabled={index === fields.length - 1}
                onClick={() => onMove(1)}
              >
                <ArrowDown className="size-3.5" aria-hidden />
              </button>
            </span>
          </Tooltip>
          <Tooltip content={T.duplicate}>
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-square"
              aria-label={L.duplicateField(name)}
              onClick={onDuplicate}
            >
              <Copy className="size-3.5" aria-hidden />
            </button>
          </Tooltip>
          {field.fieldAction === 'revert' && (
            <Tooltip content={T.revert}>
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-square"
                aria-label={L.revertField(name)}
                onClick={onRevert}
              >
                <RotateCcw className="size-3.5" aria-hidden />
              </button>
            </Tooltip>
          )}
          {/* Inherited fields come from the template; they can be reverted, not removed. */}
          {!isInheritedField(field) && (
            <Tooltip content={T.removeField}>
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-square text-error"
                aria-label={L.removeField(name)}
                onClick={onRemove}
              >
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </Tooltip>
          )}
        </div>
      </header>

      {invalid && (
        <p role="alert" className={styles.invalidText}>
          {invalid.message}
        </p>
      )}

      <div id={`${idPrefix}-body`} hidden={!isOpen} className={styles.fieldBody}>
        {isLocked && <p className={styles.note}>{L.inheritedHint}</p>}

        <div className={styles.fieldGrid}>
          <TextField
            id={`${domId}-label`}
            label={L.label}
            isRequired
            value={field.label}
            error={errorFor('fieldLabel')}
            onChange={(e) => update({ label: e.target.value })}
            onBlur={onLabelBlur}
          />

          {isCatalogKey ? (
            <FormField
              label={L.fieldKey}
              isRequired
              htmlFor={`${idPrefix}-key`}
              error={errorFor('fieldKey', 'duplicateKey')}
              hint={L.fieldKeyCatalogHint}
            >
              <DropdownSelect
                id={`${idPrefix}-key`}
                value={shownKey}
                options={fieldKeyOptions(shownKey, fields, index, catalogSection)}
                isInvalid={!!errorFor('fieldKey', 'duplicateKey')}
                isRequired
                onChange={(next) => next !== shownKey && onKeyPick(next)}
              />
            </FormField>
          ) : (
            <TextField
              label={L.fieldKey}
              isRequired
              value={shownKey}
              readOnly
              className="font-mono"
              hint={isFollowing ? L.fieldKeyLiveHint : L.fieldKeyFrozenHint}
              error={errorFor('fieldKey', 'duplicateKey')}
            />
          )}

          <FormField
            label={L.type}
            isRequired
            htmlFor={`${idPrefix}-type`}
            error={errorFor('fieldType')}
          >
            <DropdownSelect
              id={`${idPrefix}-type`}
              value={field.type}
              options={shownTypeOptions}
              isDisabled={isTypeLocked}
              isInvalid={!!errorFor('fieldType')}
              isRequired
              onChange={(next) => onChange(changeFieldType(field, next as FieldType))}
            />
          </FormField>

          <FormField label={L.width} htmlFor={`${idPrefix}-width`} hint={L.widthValue(width)}>
            <input
              id={`${idPrefix}-width`}
              type="range"
              min={1}
              max={24}
              value={width}
              disabled={isLocked}
              className="range range-xs range-primary"
              onChange={(e) => update({ width: Number(e.target.value) })}
            />
          </FormField>

          <label className={styles.switchRow}>
            <input
              type="checkbox"
              className="toggle toggle-sm toggle-primary"
              checked={!!field.required}
              onChange={(e) => update({ required: e.target.checked })}
            />
            {L.required}
          </label>

          {PLACEHOLDER_TYPES.has(field.type) && (
            <TextField
              label={L.placeholder}
              value={field.placeholder ?? ''}
              disabled={isLocked}
              onChange={(e) => update({ placeholder: e.target.value })}
            />
          )}

          {OPTION_TYPES.has(field.type) && (
            <div className={styles.fullRow}>
              <FormField
                label={L.options}
                isRequired
                htmlFor={`${idPrefix}-options`}
                error={errorFor('fieldOptions')}
              >
                <OptionsEditor
                  id={`${idPrefix}-options`}
                  options={field.options ?? []}
                  isDisabled={isLocked}
                  isInvalid={!!errorFor('fieldOptions')}
                  onChange={(options) => update({ options })}
                />
              </FormField>
            </div>
          )}

          {field.type === 'lookup' && (
            <FormField
              label={L.dataSource}
              isRequired
              htmlFor={`${idPrefix}-source`}
              error={errorFor('fieldSource')}
            >
              <DropdownSelect
                id={`${idPrefix}-source`}
                value={field.source ?? ''}
                options={lookupSources}
                emptyLabel={FORM_LABELS.selectPlaceholder}
                isInvalid={!!errorFor('fieldSource')}
                isRequired
                onChange={(source) => update({ source: source || undefined })}
              />
            </FormField>
          )}

          {field.type === 'auto' && (
            <p className={clsx(styles.note, styles.fullRow)}>
              <Info className="size-4 shrink-0" aria-hidden /> {L.autoNote}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
