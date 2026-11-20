import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { EcrfDesign, EcrfTemplate } from '@/types';
import type { FormBuilderConfig } from '@/components/dynamic-form';
import { notify, useEcrfTemplatesStore } from '@/store';
import { isSameText } from '@/utils/string.utils';
import { SYSTEM_DEFAULT_ECRF } from '@/data/ecrf-templates.seed';
import { useMasterOptions } from '@/features/masters';
import { useFormTabs } from '@/features/user-common';
import {
  buildSectionKeyCatalog,
  dbConfigToBuilderConfig,
  toDbConfig,
  type FormBuilderHandle,
} from '@/features/form-builder';
import {
  CATALOG_LAYER_NAMES,
  ECRF_TEMPLATE_LABELS as L,
  ECRF_TEMPLATE_VALIDATION as V,
} from '../constants/ecrf-templates.constants';
import {
  buildEcrfTemplateSchema,
  type EcrfTemplateFormValues,
} from '../schemas/ecrf-template.schema';
import { isNameTaken, templateErrorMessage } from '../utils/ecrf-template-errors.utils';
import type { EcrfFormMode } from './useEcrfTemplateEditor';
import { useSupportedFieldTypes } from './useSupportedFieldTypes';
import { useUnsavedDraft } from './useUnsavedDraft';

interface EcrfTemplateFormOptions {
  mode: EcrfFormMode;
  /** Edit only: the template and its design as loaded. */
  template?: EcrfTemplate;
  design?: EcrfDesign;
  /** Called after a successful save (closes the drawer). */
  onDone: () => void;
}

const TABS = ['details', 'builder'] as const;
const FIELD_TABS = {
  name: 'details',
  productGroupId: 'details',
  suitableFor: 'details',
  status: 'details',
} as const;

const toFormValues = (t?: EcrfTemplate): EcrfTemplateFormValues => ({
  name: t?.name ?? '',
  productGroupId: t?.productGroupId ?? '',
  suitableFor: t?.suitableFor ?? '',
  status: t?.status ?? 'active',
});

/** The saved design as builder config, plus its JSON to tell whether anything changed. */
const seedFrom = (design?: EcrfDesign) => {
  const draft = dbConfigToBuilderConfig(design?.config ?? null);
  return { draft, baseline: JSON.stringify(toDbConfig(draft)) };
};

/** Details tab (react-hook-form) + Form Builder tab (a controlled draft), saved together. */
export function useEcrfTemplateForm({ mode, template: loaded, design, onDone }: EcrfTemplateFormOptions) {
  const templates = useEcrfTemplatesStore((s) => s.templates);
  const { create, updateDetails, setActive, saveDesign } = useEcrfTemplatesStore.getState();
  // The list's copy is kept up to date by every save, so a retry after a partial failure
  // only sends what is still different.
  const template = templates.find((t) => t.id === loaded?.id) ?? loaded;
  const productGroupOptions = useMasterOptions('productGroup', template?.productGroupId);
  const fieldTypes = useSupportedFieldTypes();
  const tabs = useFormTabs(TABS, FIELD_TABS);
  const builderRef = useRef<FormBuilderHandle>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // An early hint only; the backend has the final say on unique names.
  const schema = useMemo(
    () =>
      buildEcrfTemplateSchema((name) =>
        templates.some((t) => t.id !== template?.id && isSameText(t.name, name))
      ),
    [templates, template?.id]
  );
  const form = useForm<EcrfTemplateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(template),
  });

  // The drawer remounts per template, so the design is seeded once from what was loaded.
  const entityId = template?.id ?? 'new';
  const [seed, setSeed] = useState(() => seedFrom(design));
  const [draft, setDraft] = useState<FormBuilderConfig>(seed.draft);
  // Sent with each design save; the backend refuses it if someone else saved in between.
  const [draftRevision, setDraftRevision] = useState(design?.draftRevision ?? null);

  const isDraftDirty = useMemo(
    () => JSON.stringify(toDbConfig(draft)) !== seed.baseline,
    [draft, seed.baseline]
  );
  const isDirty = form.formState.isDirty || isDraftDirty;
  const unsaved = useUnsavedDraft({ entityId, form, draft, setDraft, isDirty });

  // Reusable keys: the system default plus this template's saved design. Only field types the
  // backend can store are offered, since picking a key copies its type.
  const sectionKeyCatalog = useMemo(() => {
    if (mode !== 'edit') {
      return undefined;
    }
    const system = dbConfigToBuilderConfig(SYSTEM_DEFAULT_ECRF);
    const savable = {
      ...system,
      sections: system.sections.map((s) => ({
        ...s,
        fields: s.fields.filter((f) => f.type !== '' && fieldTypes.includes(f.type)),
      })),
    };
    return buildSectionKeyCatalog([
      { name: CATALOG_LAYER_NAMES.system, config: savable },
      { name: CATALOG_LAYER_NAMES.own, config: seed.draft },
    ]);
  }, [mode, fieldTypes, seed.draft]);

  const handleNext = async () => {
    if (await form.trigger()) {
      tabs.setActiveTab('builder');
    }
  };

  const handleSave = async () => {
    if (!(await form.trigger())) {
      tabs.setActiveTab('details');
      return;
    }
    // The builder tab is hidden, not unmounted, so its validate() can run from either tab.
    tabs.setActiveTab('builder');
    if (!builderRef.current?.validate()) {
      return;
    }
    setIsConfirmOpen(true);
  };

  /** Create: the details and design in one call, then the status if it isn't the default. */
  const createTemplate = async (values: EcrfTemplateFormValues, config: FormBuilderConfig) => {
    const created = await create({
      name: values.name,
      productGroupId: values.productGroupId,
      suitableFor: values.suitableFor,
      config,
    });
    if (values.status === 'inactive') {
      // The template exists by now, so a failure here must not offer to create it again.
      try {
        await setActive(created.id, false);
      } catch {
        notify.error(L.statusFailed(values.name));
        return;
      }
    }
    notify.success(L.created(values.name));
  };

  /** Edit: each part is saved only if it changed (the backend audits every call). */
  const updateTemplate = async (
    current: EcrfTemplate,
    values: EcrfTemplateFormValues,
    config: FormBuilderConfig
  ) => {
    const productGroupId = values.productGroupId !== current.productGroupId ? values.productGroupId : undefined;
    const suitableFor = values.suitableFor !== current.suitableFor ? values.suitableFor : undefined;
    if (productGroupId !== undefined || suitableFor !== undefined) {
      await updateDetails(current.id, { productGroupId, suitableFor });
    }
    if (isDraftDirty) {
      const saved = await saveDesign(current.id, config, draftRevision);
      setDraftRevision(saved.draftRevision);
      setSeed((s) => ({ ...s, baseline: JSON.stringify(config) }));
    }
    if (values.status !== current.status) {
      await setActive(current.id, values.status === 'active');
    }
    notify.success(L.saved(values.name));
  };

  const handleConfirmSave = async () => {
    const raw = form.getValues();
    const values = { ...raw, name: raw.name.trim(), suitableFor: raw.suitableFor.trim() };
    const config = toDbConfig(draft);
    setIsSaving(true);
    try {
      if (mode === 'create') {
        await createTemplate(values, config);
      } else if (template) {
        await updateTemplate(template, values, config);
      }
      setIsConfirmOpen(false);
      unsaved.markSaved();
      onDone();
    } catch (error) {
      setIsConfirmOpen(false);
      if (isNameTaken(error)) {
        form.setError('name', { type: 'unique', message: V.nameTaken });
        tabs.setActiveTab('details');
      } else {
        notify.error(templateErrorMessage(error, config));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const name = form.watch('name')?.trim() || template?.name || '';

  return {
    title: mode === 'create' ? L.createTitle : L.editTitle,
    subtitle: mode === 'edit' ? template?.name : L.createDescription,
    // The name is read-only on edit (AMS p.17); the edit screen states that changes don't reach projects (BR-TPL-11).
    isNameLocked: mode === 'edit',
    detailsHint: mode === 'edit' ? L.detailsHintEdit : L.detailsHint,
    tabs,
    form,
    productGroupOptions,
    draft,
    setDraft,
    builderRef,
    fieldTypes,
    // A new template has no saved answers yet: keys simply follow the labels.
    keyMode: mode === 'create' ? ('auto' as const) : undefined,
    sectionKeyCatalog,
    isDirty,
    isSaving,
    recovery: unsaved.recovery,
    leaveConfirm: {
      ...unsaved.leaveConfirm,
      title: L.leaveTitle,
      message: L.leaveMessage,
      confirmLabel: L.leaveConfirm,
      cancelLabel: L.leaveCancel,
    },
    primaryLabel: tabs.activeTab === 'details' ? L.next : L.save,
    handlePrimary: tabs.activeTab === 'details' ? handleNext : handleSave,
    confirm: {
      isOpen: isConfirmOpen,
      title: L.confirmSaveTitle,
      message: mode === 'create' ? L.confirmSave(name) : L.confirmSaveEdit(name),
      onConfirm: () => {
        if (!isSaving) {
          void handleConfirmSave();
        }
      },
      onCancel: () => setIsConfirmOpen(false),
    },
  };
}

export type EcrfTemplateFormModel = ReturnType<typeof useEcrfTemplateForm>;
