import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Eye, FlaskConical, LayoutList, Plus } from 'lucide-react';
import clsx from 'clsx';
import {
  DynamicForm,
  type FieldConfig,
  type FieldPosition,
  type FieldType,
  type FormBuilderConfig,
  type LookupResolver,
  type SectionConfig,
} from '@/components/dynamic-form';
import { ConfirmDialog, EmptyState } from '@/components/feedback';
import type { SelectOption } from '@/components/form';
import { Tooltip } from '@/components/overlay';
import { FIELD_TYPE_OPTIONS, FORM_BUILDER_LABELS as L } from '../constants/form-builder.constants';
import type {
  FormBuilderHandle,
  IncompleteItem,
  KeyMode,
  RemovedField,
  SectionKeyCatalog,
} from '../form-builder.types';
import {
  findCatalogSection,
  mergeCatalogFieldMatch,
  mergeCatalogSectionMatch,
} from '../utils/catalog.utils';
import {
  createField,
  createSection,
  dropOrphanedRules,
  duplicateField,
  insertField,
  moveItem,
  normalizeConfig,
  pushRemovedField,
  restoreField,
} from '../utils/config.utils';
import {
  commitPendingKeys,
  otherFieldKeys,
  otherSectionKeys,
  resolveLabelBlurKey,
  resolveSectionBlurKey,
} from '../utils/key.utils';
import { findFirstIncomplete, isSameIncomplete } from '../utils/validation.utils';
import { useFlipAnimation } from '../hooks/useFlipAnimation';
import { SectionEditor } from './SectionEditor';
import { TestRunPanel } from './TestRunPanel';
import styles from './FormBuilder.module.css';

export interface FormBuilderProps {
  value: FormBuilderConfig | null | undefined;
  onChange: (next: FormBuilderConfig) => void;
  /** Hides Add / Move / Remove Section. */
  singleSection?: boolean;
  /** `auto`: keys are read-only and derived from labels. */
  keyMode?: KeyMode;
  /** Turns Section Key / Field Key into dropdowns of reusable keys. */
  sectionKeyCatalog?: SectionKeyCatalog;
  /** Inherited fields only; receives "sectionKey.fieldKey". */
  onRevertField?: (compositeKey: string) => void;
  /** Data sources offered for `lookup` fields. */
  lookupSources?: SelectOption[];
  /** Options of each data source, for the preview. */
  resolveLookup?: LookupResolver;
  /** Field types offered in the Type dropdown. Defaults to every type. */
  fieldTypes?: readonly FieldType[];
}

interface PendingConfirm {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
}

/** Expanded / removed state is keyed by a stable id; key-based ids are carried over on a key change. */
const sectionId = (section: SectionConfig) => section.uid ?? `key:${section.key}`;

/**
 * Controlled form designer: editor on the left, the real renderer as a live preview on the right.
 * `ref.validate()` marks and scrolls to the first incomplete item.
 */
export const FormBuilder = forwardRef<FormBuilderHandle, FormBuilderProps>(function FormBuilder(
  {
    value,
    onChange,
    singleSection,
    keyMode,
    sectionKeyCatalog,
    onRevertField,
    lookupSources = [],
    resolveLookup,
    fieldTypes,
  },
  ref
) {
  const idPrefix = useId();
  const typeOptions = useMemo(
    () =>
      fieldTypes
        ? FIELD_TYPE_OPTIONS.filter((o) => fieldTypes.includes(o.value as FieldType))
        : FIELD_TYPE_OPTIONS,
    [fieldTypes]
  );
  const config = useMemo(() => normalizeConfig(value), [value]);
  const { sections } = config;
  const sectionListRef = useFlipAnimation<HTMLDivElement>(
    sections.map((s, i) => s.uid ?? `key:${s.key}:${i}`).join('|')
  );

  // Sections that were there on load start collapsed; ones added in this session open expanded.
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [removed, setRemoved] = useState<Record<string, RemovedField[]>>({});
  const [invalid, setInvalid] = useState<IncompleteItem | null>(null);
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  // One field card open at a time keeps long sections scannable.
  const [openFieldId, setOpenFieldId] = useState<string | null>(null);
  const [flashFieldId, setFlashFieldId] = useState<string | null>(null);
  // The field hovered in either column; its twin in the other column is outlined.
  const [linked, setLinked] = useState<FieldPosition | null>(null);
  const [previewMode, setPreviewMode] = useState<'preview' | 'test'>('preview');
  const flashTimer = useRef<number>();

  useEffect(() => () => window.clearTimeout(flashTimer.current), []);

  const fieldIdAt = (list: SectionConfig[], sectionIndex: number, fieldIndex: number) =>
    list[sectionIndex]?.fields[fieldIndex]?.uid ?? `${sectionIndex}:${fieldIndex}`;

  // Flags appear only after validate(), and disappear once that item is fixed.
  const shownInvalid = useMemo(
    () =>
      invalid && isSameIncomplete(invalid, findFirstIncomplete(sections, keyMode)) ? invalid : null,
    [invalid, sections, keyMode]
  );

  const domId = (sectionIndex: number, fieldIndex?: number) =>
    `${idPrefix}-s${sectionIndex}${fieldIndex === undefined ? '' : `-f${fieldIndex}`}`;

  const setSections = (next: SectionConfig[]) => onChange({ ...config, sections: next });

  const updateSection = (index: number, next: SectionConfig) => {
    const before = sections[index];
    if (!before.uid && before.key !== next.key) {
      renameExpanded(sectionId(before), sectionId(next));
    }
    setSections(sections.map((s, i) => (i === index ? next : s)));
  };

  const updateFields = (index: number, fields: FieldConfig[]) =>
    updateSection(index, { ...sections[index], fields });

  const renameExpanded = (from: string, to: string) =>
    setExpanded((prev) => {
      if (!prev.has(from)) {
        return prev;
      }
      const next = new Set(prev);
      next.delete(from);
      next.add(to);
      return next;
    });

  const setSectionExpanded = (id: string, isOpen: boolean) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (isOpen) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });

  /**
   * Opens a field card (and its section), scrolls it to the middle, focuses its label and
   * flashes it, so the user sees exactly which card they landed on.
   */
  const openAndFocusField = (
    sectionIndex: number,
    fieldIndex: number,
    id: string,
    sectionKeyId: string
  ) => {
    setSectionExpanded(sectionKeyId, true);
    setOpenFieldId(id);
    setFlashFieldId(id);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashFieldId(null), 1400);
    // After React has rendered the expanded card.
    requestAnimationFrame(() => {
      const cardId = domId(sectionIndex, fieldIndex);
      document.getElementById(cardId)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      document.getElementById(`${cardId}-label`)?.focus({ preventScroll: true });
    });
  };

  useImperativeHandle(
    ref,
    () => ({
      validate: () => {
        // A label that still has focus hasn't committed its key yet; commit everything first.
        const committed = commitPendingKeys(sections);
        if (committed !== sections) {
          onChange({ ...config, sections: committed });
        }
        const item = findFirstIncomplete(committed, keyMode);
        setInvalid(item);
        if (!item) {
          return true;
        }
        setSectionExpanded(sectionId(committed[item.sectionIndex]), true);
        if (item.fieldIndex !== undefined) {
          setOpenFieldId(fieldIdAt(committed, item.sectionIndex, item.fieldIndex));
        }
        // Wait for the section to expand (and the host to show this tab) before scrolling.
        requestAnimationFrame(() =>
          document
            .getElementById(domId(item.sectionIndex, item.fieldIndex))
            ?.scrollIntoView({ block: 'center', behavior: 'smooth' })
        );
        return false;
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sections, config, keyMode, onChange]
  );

  // ---- sections ----

  const handleAddSection = () => {
    const section = createSection(sections);
    setSectionExpanded(sectionId(section), true);
    setSections([...sections, section]);
  };

  const handleRemoveSection = (index: number) => {
    const section = sections[index];
    const name = section.title.trim() || L.untitledSection(index + 1);
    setPending({
      title: L.confirmRemoveSectionTitle,
      message: L.confirmRemoveSection(name),
      confirmLabel: L.remove,
      onConfirm: () => setSections(sections.filter((_, i) => i !== index)),
    });
  };

  const handleSectionTitleBlur = (index: number) => {
    const section = sections[index];
    const key = resolveSectionBlurKey(section, otherSectionKeys(sections, index));
    if (key !== section.key) {
      updateSection(index, { ...section, key });
    }
  };

  const handleSectionKeyPick = (index: number, catalogKey: string) => {
    const entry = sectionKeyCatalog?.find((s) => s.key === catalogKey);
    if (entry) {
      updateSection(
        index,
        mergeCatalogSectionMatch(sections[index], entry, otherSectionKeys(sections, index))
      );
    }
  };

  // ---- fields ----

  const handleAddField = (index: number) => {
    const section = sections[index];
    const field = createField(section.fields);
    updateFields(index, [...section.fields, field]);
    openAndFocusField(index, section.fields.length, field.uid ?? '', sectionId(section));
  };

  const handleInsertField = (index: number, atIndex: number) => {
    const section = sections[index];
    const { fields, field } = insertField(section.fields, atIndex);
    updateFields(index, fields);
    openAndFocusField(index, atIndex, field.uid ?? '', sectionId(section));
  };

  const handleDuplicateField = (index: number, fieldIndex: number) => {
    const section = sections[index];
    const fields = duplicateField(section.fields, fieldIndex, L.copySuffix);
    updateFields(index, fields);
    openAndFocusField(index, fieldIndex + 1, fields[fieldIndex + 1].uid ?? '', sectionId(section));
  };

  const handlePreviewSelect = ({ sectionIndex, fieldIndex }: FieldPosition) =>
    openAndFocusField(
      sectionIndex,
      fieldIndex,
      fieldIdAt(sections, sectionIndex, fieldIndex),
      sectionId(sections[sectionIndex])
    );

  const handleFieldToggle = (index: number, fieldIndex: number) => {
    const id = fieldIdAt(sections, index, fieldIndex);
    setOpenFieldId((current) => (current === id ? null : id));
  };

  const handleFieldChange = (index: number, fieldIndex: number, next: FieldConfig) =>
    updateFields(
      index,
      sections[index].fields.map((f, i) => (i === fieldIndex ? next : f))
    );

  // The derived key is committed on blur, not per keystroke: a key change per keystroke would
  // churn every place the key is used (preview names, dedupe) while the user is still typing.
  const handleFieldLabelBlur = (index: number, fieldIndex: number) => {
    const fields = sections[index].fields;
    const field = fields[fieldIndex];
    const key = resolveLabelBlurKey(field, otherFieldKeys(fields, fieldIndex));
    if (key !== field.key) {
      handleFieldChange(index, fieldIndex, { ...field, key });
    }
  };

  const handleFieldKeyPick = (index: number, fieldIndex: number, catalogKey: string) => {
    const section = sections[index];
    const entry = findCatalogSection(sectionKeyCatalog, section)?.fields.find(
      (f) => f.key === catalogKey
    );
    if (entry) {
      const fields = section.fields;
      handleFieldChange(
        index,
        fieldIndex,
        mergeCatalogFieldMatch(fields[fieldIndex], entry, otherFieldKeys(fields, fieldIndex))
      );
    }
  };

  const handleFieldRemove = (index: number, fieldIndex: number) => {
    const section = sections[index];
    const field = section.fields[fieldIndex];
    const name = field.label.trim() || L.untitledField;
    setPending({
      title: L.confirmRemoveFieldTitle,
      message: L.confirmRemoveField(name),
      confirmLabel: L.remove,
      onConfirm: () => {
        const id = sectionId(section);
        setRemoved((prev) => ({
          ...prev,
          [id]: pushRemovedField(prev[id] ?? [], { field, index: fieldIndex }),
        }));
        updateFields(
          index,
          dropOrphanedRules(
            section.fields.filter((_, i) => i !== fieldIndex),
            field.key
          )
        );
      },
    });
  };

  const handleFieldRevert = (index: number, fieldIndex: number) => {
    const section = sections[index];
    const field = section.fields[fieldIndex];
    const name = field.label.trim() || L.untitledField;
    setPending({
      title: L.confirmRevertTitle,
      message: L.confirmRevert(name),
      confirmLabel: L.revert,
      onConfirm: () => onRevertField?.(`${section.key}.${field.key}`),
    });
  };

  const handleRestore = (index: number, entry: RemovedField) => {
    const section = sections[index];
    const id = sectionId(section);
    setRemoved((prev) => ({ ...prev, [id]: (prev[id] ?? []).filter((e) => e !== entry) }));
    updateFields(index, restoreField(section.fields, entry));
  };

  // "Section N" stands in for an untitled section in the preview only; it is never written back.
  const previewConfig = useMemo<FormBuilderConfig>(
    () => ({
      sections: sections.map((s, i) => ({
        ...s,
        title: s.title.trim() || L.untitledSection(i + 1),
      })),
    }),
    [sections]
  );

  return (
    <div className={styles.builder}>
      <div ref={sectionListRef} className={styles.editor}>
        <div className={styles.columnHeader}>
          <div>
            <h3 className={styles.columnTitle}>{L.editorTitle}</h3>
            <p className={styles.columnHint}>{L.editorHint}</p>
          </div>
          {!singleSection && sections.length > 0 && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddSection}>
              <Plus className="size-4" aria-hidden /> {L.addSection}
            </button>
          )}
        </div>

        {sections.length === 0 ? (
          <EmptyState
            icon={LayoutList}
            title={L.emptyTitle}
            description={L.emptyDescription}
            action={
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddSection}>
                <Plus className="size-4" aria-hidden /> {L.addSection}
              </button>
            }
          />
        ) : (
          sections.map((section, index) => (
            <SectionEditor
              key={section.uid ?? index}
              section={section}
              index={index}
              sections={sections}
              isExpanded={expanded.has(sectionId(section))}
              singleSection={singleSection}
              keyMode={keyMode}
              catalog={sectionKeyCatalog}
              invalid={shownInvalid?.sectionIndex === index ? shownInvalid : null}
              removed={removed[sectionId(section)] ?? []}
              domId={(fieldIndex) => domId(index, fieldIndex)}
              lookupSources={lookupSources}
              typeOptions={typeOptions}
              fieldId={(fieldIndex) => fieldIdAt(sections, index, fieldIndex)}
              openFieldId={openFieldId}
              flashFieldId={flashFieldId}
              linkedFieldIndex={linked?.sectionIndex === index ? linked.fieldIndex : undefined}
              onFieldToggle={(fieldIndex) => handleFieldToggle(index, fieldIndex)}
              onFieldHover={(fieldIndex) =>
                setLinked(fieldIndex === null ? null : { sectionIndex: index, fieldIndex })
              }
              onFieldDuplicate={(fieldIndex) => handleDuplicateField(index, fieldIndex)}
              onInsertField={(atIndex) => handleInsertField(index, atIndex)}
              onToggle={() =>
                setSectionExpanded(sectionId(section), !expanded.has(sectionId(section)))
              }
              onChange={(next) => updateSection(index, next)}
              onTitleBlur={() => handleSectionTitleBlur(index)}
              onKeyPick={(key) => handleSectionKeyPick(index, key)}
              onMove={(delta) => setSections(moveItem(sections, index, index + delta))}
              onRemove={() => handleRemoveSection(index)}
              onAddField={() => handleAddField(index)}
              onFieldChange={(fieldIndex, next) => handleFieldChange(index, fieldIndex, next)}
              onFieldLabelBlur={(fieldIndex) => handleFieldLabelBlur(index, fieldIndex)}
              onFieldKeyPick={(fieldIndex, key) => handleFieldKeyPick(index, fieldIndex, key)}
              onFieldMove={(fieldIndex, delta) =>
                updateFields(index, moveItem(section.fields, fieldIndex, fieldIndex + delta))
              }
              onFieldRemove={(fieldIndex) => handleFieldRemove(index, fieldIndex)}
              onFieldRevert={(fieldIndex) => handleFieldRevert(index, fieldIndex)}
              onRestore={(entry) => handleRestore(index, entry)}
            />
          ))
        )}
      </div>

      <aside className={styles.preview} aria-label={L.previewTitle}>
        <div className={styles.columnHeader}>
          <div>
            <h3 className={styles.columnTitle}>{L.previewTitle}</h3>
            <p className={styles.columnHint}>
              {previewMode === 'test' ? L.testHint : `${L.previewHint} ${L.previewHintClick}`}
            </p>
          </div>
          <div role="group" aria-label={L.modeGroup} className={styles.modeSwitch}>
            {(['preview', 'test'] as const).map((mode) => (
              <Tooltip key={mode} content={mode === 'preview' ? L.tips.preview : L.tips.test}>
                <button
                  type="button"
                  aria-pressed={previewMode === mode}
                  className={clsx(
                    styles.modeButton,
                    previewMode === mode && styles.modeButtonActive
                  )}
                  onClick={() => setPreviewMode(mode)}
                >
                  {mode === 'preview' ? (
                    <Eye className="size-3.5" aria-hidden />
                  ) : (
                    <FlaskConical className="size-3.5" aria-hidden />
                  )}
                  {mode === 'preview' ? L.previewMode : L.testMode}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>
        {sections.length > 0 &&
          (previewMode === 'test' ? (
            <TestRunPanel config={previewConfig} resolveLookup={resolveLookup} />
          ) : (
            <DynamicForm
              config={previewConfig}
              preview
              resolveLookup={resolveLookup}
              activeField={linked}
              onFieldSelect={handlePreviewSelect}
              onFieldHover={setLinked}
            />
          ))}
      </aside>

      <ConfirmDialog
        isOpen={!!pending}
        title={pending?.title ?? ''}
        message={pending?.message ?? ''}
        confirmLabel={pending?.confirmLabel}
        tone="danger"
        onConfirm={() => {
          pending?.onConfirm();
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />
    </div>
  );
});
