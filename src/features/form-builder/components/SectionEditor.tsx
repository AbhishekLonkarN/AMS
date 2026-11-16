import { Fragment, useId } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2, Undo2 } from 'lucide-react';
import clsx from 'clsx';
import type { FieldConfig, SectionConfig } from '@/components/dynamic-form';
import {
  DropdownSelect,
  FormField,
  TextAreaField,
  TextField,
  type SelectOption,
} from '@/components/form';
import { Tooltip } from '@/components/overlay';
import { FORM_BUILDER_LABELS as L } from '../constants/form-builder.constants';
import type {
  IncompleteItem,
  KeyMode,
  RemovedField,
  SectionKeyCatalog,
} from '../form-builder.types';
import { findCatalogSection, sectionKeyOptions } from '../utils/catalog.utils';
import {
  isPlaceholderSectionKey,
  otherSectionKeys,
  resolveSectionBlurKey,
} from '../utils/key.utils';
import { useFlipAnimation } from '../hooks/useFlipAnimation';
import { FieldEditor } from './FieldEditor';
import styles from './FormBuilder.module.css';

const T = L.tips;

interface SectionEditorProps {
  section: SectionConfig;
  index: number;
  sections: SectionConfig[];
  isExpanded: boolean;
  singleSection?: boolean;
  keyMode?: KeyMode;
  catalog?: SectionKeyCatalog;
  /** The problem `validate()` stopped at, when it is in this section. */
  invalid: IncompleteItem | null;
  removed: RemovedField[];
  domId: (fieldIndex?: number) => string;
  lookupSources: SelectOption[];
  /** Stable id of a field card (open / flash state is keyed by it). */
  fieldId: (fieldIndex: number) => string;
  openFieldId: string | null;
  flashFieldId: string | null;
  /** Field linked to the preview (hovered there or here), when it is in this section. */
  linkedFieldIndex?: number;
  onFieldToggle: (fieldIndex: number) => void;
  onFieldHover: (fieldIndex: number | null) => void;
  onFieldDuplicate: (fieldIndex: number) => void;
  /** Adds a blank field at this position (between two cards). */
  onInsertField: (atIndex: number) => void;
  onToggle: () => void;
  onChange: (next: SectionConfig) => void;
  onTitleBlur: () => void;
  onKeyPick: (catalogKey: string) => void;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
  onAddField: () => void;
  onFieldChange: (fieldIndex: number, next: FieldConfig) => void;
  onFieldLabelBlur: (fieldIndex: number) => void;
  onFieldKeyPick: (fieldIndex: number, catalogKey: string) => void;
  onFieldMove: (fieldIndex: number, delta: -1 | 1) => void;
  onFieldRemove: (fieldIndex: number) => void;
  onFieldRevert: (fieldIndex: number) => void;
  onRestore: (entry: RemovedField) => void;
}

export function SectionEditor({
  section,
  index,
  sections,
  isExpanded,
  singleSection,
  keyMode,
  catalog,
  invalid,
  removed,
  domId,
  lookupSources,
  fieldId,
  openFieldId,
  flashFieldId,
  linkedFieldIndex,
  onFieldToggle,
  onFieldHover,
  onFieldDuplicate,
  onInsertField,
  onToggle,
  onChange,
  onTitleBlur,
  onKeyPick,
  onMove,
  onRemove,
  onAddField,
  onFieldChange,
  onFieldLabelBlur,
  onFieldKeyPick,
  onFieldMove,
  onFieldRemove,
  onFieldRevert,
  onRestore,
}: SectionEditorProps) {
  const idPrefix = useId();
  const name = section.title.trim() || L.untitledSection(index + 1);
  const bodyId = `${idPrefix}-body`;
  const sectionError = invalid && invalid.fieldIndex === undefined ? invalid : null;
  const catalogSection = findCatalogSection(catalog, section);
  const isCatalogKey = !!catalog && keyMode !== 'auto';
  // Until the name is first committed, the key box previews the key the name will produce.
  const shownKey = isPlaceholderSectionKey(section)
    ? resolveSectionBlurKey(section, otherSectionKeys(sections, index))
    : section.catalogKey || section.key;
  const fieldListRef = useFlipAnimation<HTMLDivElement>(
    section.fields.map((f, i) => f.uid ?? `${f.key}:${i}`).join('|')
  );

  return (
    <section
      id={domId()}
      data-flip-id={section.uid ?? `key:${section.key}:${index}`}
      className={clsx(styles.sectionCard, invalid && styles.invalid)}
      aria-label={name}
    >
      <header className={styles.sectionHeader}>
        <button
          type="button"
          className={styles.sectionToggle}
          aria-expanded={isExpanded}
          aria-controls={bodyId}
          aria-label={isExpanded ? L.collapse(name) : L.expand(name)}
          onClick={onToggle}
        >
          <ChevronDown
            className={clsx(styles.chevron, isExpanded && styles.chevronOpen)}
            aria-hidden
          />
          <span className={styles.sectionName}>{name}</span>
          <span className={styles.sectionMeta}>{L.fieldCount(section.fields.length)}</span>
        </button>
        {!singleSection && (
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
                  disabled={index === sections.length - 1}
                  onClick={() => onMove(1)}
                >
                  <ArrowDown className="size-3.5" aria-hidden />
                </button>
              </span>
            </Tooltip>
            <Tooltip content={T.removeSection}>
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-square text-error"
                aria-label={L.removeSection(name)}
                onClick={onRemove}
              >
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </Tooltip>
          </div>
        )}
      </header>

      {sectionError && !isExpanded && (
        <p role="alert" className={styles.invalidText}>
          {sectionError.message}
        </p>
      )}

      {/* Animated open / close: the outer grid row eases between 0 and the body's real height. */}
      <div id={bodyId} className={clsx(styles.collapse, isExpanded && styles.collapseOpen)}>
        <div className={styles.collapseInner}>
          <div className={styles.sectionBody}>
            <div className={styles.fieldGrid}>
              <TextField
                label={L.sectionName}
                isRequired
                value={section.title}
                error={sectionError?.reason === 'sectionTitle' ? sectionError.message : undefined}
                onChange={(e) => onChange({ ...section, title: e.target.value })}
                onBlur={onTitleBlur}
              />
              {isCatalogKey ? (
                <FormField
                  label={L.sectionKey}
                  isRequired
                  htmlFor={`${idPrefix}-key`}
                  error={sectionError?.reason === 'sectionKey' ? sectionError.message : undefined}
                >
                  <DropdownSelect
                    id={`${idPrefix}-key`}
                    value={shownKey}
                    options={sectionKeyOptions(shownKey, sections, index, catalog)}
                    isInvalid={sectionError?.reason === 'sectionKey'}
                    isRequired
                    onChange={(next) => next !== shownKey && onKeyPick(next)}
                  />
                </FormField>
              ) : (
                <TextField
                  label={L.sectionKey}
                  isRequired
                  value={shownKey}
                  readOnly
                  className="font-mono"
                  hint={
                    isPlaceholderSectionKey(section) ? L.sectionKeyAutoHint : L.sectionKeyFrozenHint
                  }
                  error={sectionError?.reason === 'sectionKey' ? sectionError.message : undefined}
                />
              )}
              <div className={styles.fullRow}>
                <TextAreaField
                  label={L.sectionDescription}
                  rows={2}
                  value={section.description ?? ''}
                  onChange={(e) => onChange({ ...section, description: e.target.value })}
                />
              </div>
            </div>

            <div ref={fieldListRef} className={styles.fieldList}>
              {section.fields.map((field, fieldIndex) => (
                <Fragment key={field.uid ?? fieldIndex}>
                  {/* Between two cards only: before the first is rarely wanted, after the last is "Add Field". */}
                  {fieldIndex > 0 && (
                    <div className={styles.insertSlot}>
                      <Tooltip content={T.insert}>
                        <button
                          type="button"
                          className={styles.insertButton}
                          aria-label={L.insertField(fieldIndex + 1)}
                          onClick={() => onInsertField(fieldIndex)}
                        >
                          <Plus className="size-3.5" aria-hidden />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                  <FieldEditor
                    field={field}
                    index={fieldIndex}
                    fields={section.fields}
                    domId={domId(fieldIndex)}
                    keyMode={keyMode}
                    catalogSection={catalogSection}
                    hasCatalog={!!catalog}
                    invalid={invalid?.fieldIndex === fieldIndex ? invalid : null}
                    lookupSources={lookupSources}
                    isOpen={openFieldId === fieldId(fieldIndex)}
                    isLinked={linkedFieldIndex === fieldIndex}
                    isFlashing={flashFieldId === fieldId(fieldIndex)}
                    onToggle={() => onFieldToggle(fieldIndex)}
                    onHover={(isHovered) => onFieldHover(isHovered ? fieldIndex : null)}
                    onChange={(next) => onFieldChange(fieldIndex, next)}
                    onLabelBlur={() => onFieldLabelBlur(fieldIndex)}
                    onKeyPick={(key) => onFieldKeyPick(fieldIndex, key)}
                    onMove={(delta) => onFieldMove(fieldIndex, delta)}
                    onDuplicate={() => onFieldDuplicate(fieldIndex)}
                    onRemove={() => onFieldRemove(fieldIndex)}
                    onRevert={() => onFieldRevert(fieldIndex)}
                  />
                </Fragment>
              ))}
            </div>

            {removed.length > 0 && (
              <div className={styles.removedList}>
                {removed.map((entry) => {
                  const label = entry.field.label.trim() || L.untitledField;
                  return (
                    <Tooltip key={entry.field.uid ?? entry.field.key} content={T.restore}>
                      <button
                        type="button"
                        className={styles.removedChip}
                        aria-label={L.restoreField(label)}
                        onClick={() => onRestore(entry)}
                      >
                        <Undo2 className="size-3.5" aria-hidden /> {L.removed(label)}
                      </button>
                    </Tooltip>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              className="btn btn-secondary btn-sm self-start"
              onClick={onAddField}
            >
              <Plus className="size-4" aria-hidden /> {L.addField}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
