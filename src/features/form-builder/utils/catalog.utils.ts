import type { FieldConfig, SectionConfig } from '@/components/dynamic-form';
import type { SelectOption } from '@/components/form';
import type {
  CatalogField,
  CatalogLayer,
  CatalogSection,
  SectionKeyCatalog,
} from '../form-builder.types';
import { cloneOptions } from './config.utils';
import {
  effectiveFieldKey,
  ensureUniqueKey,
  isInheritedField,
  isPlaceholderSectionKey,
  isUnsavedField,
} from './key.utils';

const toCatalogField = (field: FieldConfig, layer: string): CatalogField => ({
  key: field.key,
  label: field.label,
  type: field.type,
  required: field.required,
  placeholder: field.placeholder,
  width: field.width,
  options: cloneOptions(field.options),
  source: field.source,
  layer,
});

/**
 * Merges the layers (least specific first) into one list of reusable section and field keys.
 * On a key collision the earliest layer keeps its config (the reference definition), while
 * `layer` moves to the most specific layer that also defines the key.
 */
export function buildSectionKeyCatalog(layers: CatalogLayer[]): SectionKeyCatalog | undefined {
  const sections = new Map<string, CatalogSection>();

  for (const layer of layers) {
    for (const section of layer.config?.sections ?? []) {
      if (!section.key) {
        continue;
      }
      let entry = sections.get(section.key);
      if (entry) {
        entry.layer = layer.name;
      } else {
        entry = {
          key: section.key,
          title: section.title,
          description: section.description,
          fields: [],
          layer: layer.name,
        };
        sections.set(section.key, entry);
      }
      for (const field of section.fields) {
        if (!field.key) {
          continue;
        }
        const existing = entry.fields.find((f) => f.key === field.key);
        if (existing) {
          existing.layer = layer.name;
        } else {
          entry.fields.push(toCatalogField(field, layer.name));
        }
      }
    }
  }

  return sections.size ? [...sections.values()] : undefined;
}

export const findCatalogSection = (
  catalog: SectionKeyCatalog | undefined,
  section: SectionConfig
) => catalog?.find((c) => c.key === (section.catalogKey || section.key));

/**
 * Copies a catalog entry's settings onto a field. Whitelisted properties only (never a spread,
 * or catalog-only data like `layer` would be saved), and a label the user already typed stays.
 * An unsaved field adopts the catalog key; a saved one keeps its own, because answers exist under it.
 */
export function mergeCatalogFieldMatch(
  field: FieldConfig,
  entry: CatalogField,
  siblingKeys: string[]
): FieldConfig {
  const isAdopting = isUnsavedField(field) && !isInheritedField(field);
  const isTypeLocked = field.typeLocked ?? field.locked;
  return {
    ...field,
    label: field.label.trim() ? field.label : entry.label,
    type: isTypeLocked ? field.type : entry.type,
    required: entry.required ?? false,
    placeholder: field.locked ? field.placeholder : entry.placeholder,
    width: field.locked ? field.width : entry.width,
    options: field.locked ? field.options : cloneOptions(entry.options),
    source: entry.source,
    key: isAdopting ? ensureUniqueKey(entry.key, siblingKeys) : field.key,
    catalogFieldKey: entry.key,
  };
}

/** Same rule for sections: a placeholder key is replaced, a real one is kept. */
export function mergeCatalogSectionMatch(
  section: SectionConfig,
  entry: CatalogSection,
  siblingKeys: string[]
): SectionConfig {
  return {
    ...section,
    title: section.title.trim() ? section.title : entry.title,
    description: section.description?.trim() ? section.description : entry.description,
    key: isPlaceholderSectionKey(section) ? ensureUniqueKey(entry.key, siblingKeys) : section.key,
    catalogKey: entry.key,
  };
}

/**
 * Field Key dropdown: keys, not human labels (two "Name" fields would look identical), minus
 * keys sibling fields already use. The field's own key is always offered.
 */
export function fieldKeyOptions(
  ownKey: string,
  fields: FieldConfig[],
  index: number,
  catalogSection: CatalogSection | undefined
): SelectOption[] {
  const taken = new Set(fields.filter((_, i) => i !== index).map(effectiveFieldKey));
  const own: SelectOption = { value: ownKey, label: ownKey };
  const fromCatalog = (catalogSection?.fields ?? [])
    .filter((f) => f.key !== ownKey && !taken.has(f.key))
    .map((f) => ({ value: f.key, label: f.key, description: f.label }));
  return ownKey ? [own, ...fromCatalog] : fromCatalog;
}

export function sectionKeyOptions(
  ownKey: string,
  sections: SectionConfig[],
  index: number,
  catalog: SectionKeyCatalog | undefined
): SelectOption[] {
  const taken = new Set(sections.filter((_, i) => i !== index).map((s) => s.catalogKey || s.key));
  const own: SelectOption = { value: ownKey, label: ownKey };
  const fromCatalog = (catalog ?? [])
    .filter((s) => s.key !== ownKey && !taken.has(s.key))
    .map((s) => ({ value: s.key, label: s.key, description: s.title }));
  return ownKey ? [own, ...fromCatalog] : fromCatalog;
}
