import type { AccessRightsSet, AccessRightsSetInput, PermissionKey, UserType } from '@/types';
import { getAllPages, postJson, putJson } from './api.client';

/** A set as the backend sends it (backend field names). */
interface ApiAccessRightsSet {
  id: number;
  name: string;
  user_category: string;
  is_active: boolean;
  /** Ticked boxes as `RESOURCE.ACTION`, e.g. `SITE_ECRFS.DRAFT_SAVE`. */
  permissions: string[];
  created_by: string;
  created_at: string;
}

const BASE = '/api/v1/access-rights/templates';

const toUpperSnake = (camel: string) => camel.replace(/[A-Z]/g, (c) => `_${c}`).toUpperCase();
const toCamel = (snake: string) => snake.toLowerCase().replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

/** `siteEcrfs.draftSave` → `SITE_ECRFS.DRAFT_SAVE`. */
export const toApiPermission = (key: PermissionKey) => key.split('.').map(toUpperSnake).join('.');

/** `SITE_ECRFS.DRAFT_SAVE` → `siteEcrfs.draftSave`. */
export const fromApiPermission = (code: string) => code.split('.').map(toCamel).join('.') as PermissionKey;

const toSet = (s: ApiAccessRightsSet): AccessRightsSet => ({
  id: String(s.id),
  name: s.name,
  userType: s.user_category.toLowerCase() as UserType,
  permissions: s.permissions.map(fromApiPermission),
  status: s.is_active ? 'active' : 'inactive',
  createdByName: s.created_by,
  createdAt: s.created_at,
});

const toBody = (input: AccessRightsSetInput) => ({
  name: input.name,
  user_category: input.userType.toUpperCase(),
  is_active: input.status === 'active',
  permissions: input.permissions.map(toApiPermission),
});

/** Every set the caller may see, sorted by name. */
export const listAccessRightsSets = async (): Promise<AccessRightsSet[]> =>
  (await getAllPages<ApiAccessRightsSet>(BASE)).map(toSet);

export const createAccessRightsSet = async (input: AccessRightsSetInput) =>
  toSet(await postJson<ApiAccessRightsSet>(BASE, toBody(input)));

export const updateAccessRightsSet = async (id: string, input: AccessRightsSetInput) =>
  toSet(await putJson<ApiAccessRightsSet>(`${BASE}/${id}`, toBody(input)));

export const setAccessRightsSetActive = async (id: string, isActive: boolean) =>
  toSet(await postJson<ApiAccessRightsSet>(`${BASE}/${id}/${isActive ? 'activate' : 'deactivate'}`));
