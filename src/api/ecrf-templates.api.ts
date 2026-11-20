import type { FormBuilderConfig } from '@/components/dynamic-form';
import type { EcrfDesign, EcrfTemplate } from '@/types';
import { deleteJson, getAllPages, getJson, patchJson, postJson, putJson } from './api.client';
import { fromFormDefinition, toFormDefinition, type ApiFormDefinition } from './form-definition.mapper';

/** A template as the backend sends it. */
interface ApiEcrfTemplate {
  id: string;
  name: string;
  product_group: { id: string; code: string };
  suitable_for: string;
  status: 'ACTIVE' | 'DEACTIVATED';
  created_by: string;
  created_at: string;
  published_version_no: number | null;
  has_draft: boolean;
}

interface ApiDesign {
  version: {
    version_no: number;
    state: 'DRAFT' | 'PUBLISHED' | 'SUPERSEDED';
    revision: number;
  };
  definition: ApiFormDefinition;
}

export interface EcrfTemplateCreateInput {
  name: string;
  productGroupId: string;
  suitableFor: string;
  /** Builder config as returned by `toDbConfig`. Saved as the template's first draft. */
  config: FormBuilderConfig;
}

export interface EcrfTemplateDetailsInput {
  productGroupId?: string;
  suitableFor?: string;
}

const BASE = '/api/v1/ecrf-templates';

const toTemplate = (t: ApiEcrfTemplate): EcrfTemplate => ({
  id: t.id,
  name: t.name,
  productGroupId: t.product_group.id,
  productGroupCode: t.product_group.code,
  suitableFor: t.suitable_for,
  status: t.status === 'ACTIVE' ? 'active' : 'inactive',
  createdByName: t.created_by,
  createdAt: t.created_at,
  publishedVersionNo: t.published_version_no,
  hasDraft: t.has_draft,
});

const toDesign = (d: ApiDesign): EcrfDesign => ({
  config: fromFormDefinition(d.definition),
  versionNo: d.version.version_no,
  state: d.version.state,
  // Only an open draft has a revision to check against; saving over a published version starts a new draft.
  draftRevision: d.version.state === 'DRAFT' ? d.version.revision : null,
});

/** Every template, newest first. */
export const listEcrfTemplates = async () => (await getAllPages<ApiEcrfTemplate>(BASE)).map(toTemplate);

export const getEcrfTemplate = async (id: string) => toTemplate(await getJson<ApiEcrfTemplate>(`${BASE}/${id}`));

/** New templates start active, with the design as draft version 1. */
export const createEcrfTemplate = async (input: EcrfTemplateCreateInput) =>
  toTemplate(
    await postJson<ApiEcrfTemplate>(BASE, {
      name: input.name,
      product_group_id: input.productGroupId,
      suitable_for: input.suitableFor,
      definition: toFormDefinition(input.config),
    }),
  );

/** The name can't change once created; the design is saved with `saveEcrfTemplateDesign`. */
export const updateEcrfTemplate = async (id: string, input: EcrfTemplateDetailsInput) =>
  toTemplate(
    await patchJson<ApiEcrfTemplate>(`${BASE}/${id}`, {
      product_group_id: input.productGroupId,
      suitable_for: input.suitableFor,
    }),
  );

export const setEcrfTemplateActive = async (id: string, isActive: boolean) =>
  toTemplate(await postJson<ApiEcrfTemplate>(`${BASE}/${id}/${isActive ? 'activate' : 'deactivate'}`));

/** Refused (`in_use`) once a project has loaded the template. */
export const deleteEcrfTemplate = (id: string) => deleteJson(`${BASE}/${id}`);

/** The version being worked on: the open draft, else the published one. */
export const getEcrfTemplateDesign = async (id: string) => toDesign(await getJson<ApiDesign>(`${BASE}/${id}/design`));

/**
 * Draft Save. `draftRevision` is the one the editor loaded; the backend refuses the save
 * (`design_conflict`) if someone else saved in between.
 */
export const saveEcrfTemplateDesign = async (id: string, config: FormBuilderConfig, draftRevision: number | null) =>
  toDesign(
    await putJson<ApiDesign>(`${BASE}/${id}/design`, {
      definition: toFormDefinition(config),
      expected_revision: draftRevision,
    }),
  );

/** Makes the open draft the effective version. The design must be complete. */
export const publishEcrfTemplateDesign = async (id: string) =>
  toDesign(await postJson<ApiDesign>(`${BASE}/${id}/design/publish`));
