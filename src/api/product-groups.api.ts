import type { MasterItem } from '@/types';
import { getJson, patchJson, postJson } from './api.client';

/** A product group as the backend sends it. */
interface ApiProductGroup {
  id: string;
  code: string;
  description: string;
  is_active: boolean;
}

export interface ProductGroupInput {
  code: string;
  description: string;
}

const BASE = '/api/v1/product-groups';

/** The code is the value users see, so it becomes the master item's label. */
const toItem = (g: ApiProductGroup): MasterItem => ({
  id: g.id,
  masterKey: 'productGroup',
  label: g.code,
  description: g.description,
  status: g.is_active ? 'active' : 'inactive',
});

/** Every product group, active or not. */
export const listProductGroups = async () => (await getJson<ApiProductGroup[]>(BASE)).map(toItem);

/** New groups start active. */
export const createProductGroup = async (input: ProductGroupInput) =>
  toItem(await postJson<ApiProductGroup>(BASE, input));

export const updateProductGroup = async (id: string, input: Partial<ProductGroupInput>) =>
  toItem(await patchJson<ApiProductGroup>(`${BASE}/${id}`, input));

export const setProductGroupActive = async (id: string, isActive: boolean) =>
  toItem(await postJson<ApiProductGroup>(`${BASE}/${id}/${isActive ? 'activate' : 'deactivate'}`));
