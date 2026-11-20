import clsx from 'clsx';
import { Copy, Pencil, Trash2 } from 'lucide-react';
import type { Preset } from '@/types';
import { DetailList, type DetailItem } from '@/components/layout';
import { DrawerActions, DrawerPanel, DrawerSection } from '@/components/overlay';
import { formatDate, formatTime } from '@/utils/date.utils';
import {
  CHAR_SET_LABELS,
  CHOICE_TYPES,
  PRESET_FIELDS as F,
  PRESET_LABELS as L,
  PRESET_TYPE_META,
  TEXT_TYPES,
} from '../constants/preset-library.constants';
import { defaultValueText, ruleSummary } from '../utils/preset-rules.utils';
import { PresetFieldPreview } from './PresetFieldPreview';
import { PresetTypeChip, RuleChips } from './PresetBits';
import styles from './PresetLibrary.module.css';

interface PresetDetailViewProps {
  preset: Preset;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

const range = (min?: number | string, max?: number | string) =>
  min === undefined && max === undefined ? '' : `${min ?? '—'} – ${max ?? '—'}`;

function settingItems(preset: Preset): DetailItem[] {
  const v = preset.validation;
  const items: DetailItem[] = [
    { label: F.type, value: PRESET_TYPE_META[preset.type].label },
    { label: L.sectionRules, value: <RuleChips chips={ruleSummary(preset)} /> },
  ];
  if (CHOICE_TYPES.has(preset.type)) {
    items.push({ label: F.options, value: preset.options.map((o) => o.label).join(', ') });
  }
  if (preset.type === 'NUMERIC') {
    items.push(
      { label: F.unit, value: preset.unit },
      { label: `${F.minValue} – ${F.maxValue}`, value: range(v.minValue, v.maxValue) },
      { label: F.decimalPlaces, value: v.decimalPlaces }
    );
  }
  if (TEXT_TYPES.has(preset.type)) {
    items.push(
      { label: `${F.minLength} – ${F.maxLength}`, value: range(v.minLength, v.maxLength) },
      { label: F.charSet, value: CHAR_SET_LABELS[v.charSet ?? 'ANY'] }
    );
  }
  if (preset.type === 'DATE') {
    items.push({
      label: `${F.minDate} – ${F.maxDate}`,
      value: range(v.minDate && formatDate(v.minDate), v.maxDate && formatDate(v.maxDate)),
    });
  }
  items.push({ label: F.defaultValue, value: defaultValueText(preset, preset.defaultValue) || L.noDefault });
  return items;
}

/** Read-only drawer: try the field, then its settings in plain words. */
export function PresetDetailView({ preset, onEdit, onDuplicate, onDelete }: PresetDetailViewProps) {
  const toolbar = [
    onDuplicate && { key: 'duplicate', label: L.duplicate, icon: Copy, onClick: onDuplicate, isDanger: false },
    onDelete && { key: 'delete', label: L.delete, icon: Trash2, onClick: onDelete, isDanger: true },
  ].filter(Boolean) as { key: string; label: string; icon: typeof Copy; onClick: () => void; isDanger: boolean }[];

  return (
    <DrawerPanel
      title={preset.title}
      subtitle={L.updated(`${formatDate(preset.updatedAt)} ${formatTime(preset.updatedAt)}`)}
      headerExtra={<PresetTypeChip type={preset.type} />}
      toolbar={
        toolbar.length > 0 &&
        toolbar.map(({ key, label, icon: Icon, onClick, isDanger }) => (
          <button key={key} type="button" className={clsx('btn btn-secondary btn-sm', isDanger && 'text-error')} onClick={onClick}>
            <Icon className="size-4" aria-hidden /> {label}
          </button>
        ))
      }
      footer={<DrawerActions cancelLabel={L.close} primaryLabel={onEdit && L.edit} primaryIcon={Pencil} onPrimary={onEdit} />}
    >
      <div className={styles.layout}>
        <div className={styles.formColumn}>
          <DrawerSection title={L.viewAbout}>
            <DetailList
              items={[
                { label: F.fieldTitle, value: preset.fieldTitle },
                { label: F.description, value: preset.description },
                { label: F.instructions, value: preset.instructions },
                { label: F.createdBy, value: preset.createdByName },
              ]}
            />
          </DrawerSection>
          <DrawerSection title={L.viewSettings}>
            <DetailList items={settingItems(preset)} />
          </DrawerSection>
        </div>
        <aside className={styles.previewColumn}>
          <PresetFieldPreview
            key={preset.updatedAt}
            rules={preset}
            fieldTitle={preset.fieldTitle}
            instructions={preset.instructions}
            defaultValue={preset.defaultValue}
          />
        </aside>
      </div>
    </DrawerPanel>
  );
}
