import type { FieldType } from '@/components/dynamic-form';
import { getJson } from './api.client';
import { builderTypesFor } from './form-definition.mapper';

interface ApiCatalog {
  field_types: { type: string; settings: string[]; has_options: boolean }[];
}

/** The builder field types the backend currently supports, from the Form Builder catalog. */
export async function getSupportedFieldTypes(): Promise<FieldType[]> {
  const catalog = await getJson<ApiCatalog>('/api/v1/form-builder/catalog');
  return builderTypesFor(catalog.field_types.map((t) => t.type));
}
