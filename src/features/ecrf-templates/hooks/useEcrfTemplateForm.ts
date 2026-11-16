import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { EcrfTemplate } from '@/types';
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
} from '../constants/ecrf-templates.constants';
import {
  buildEcrfTemplateSchema,
  type EcrfTemplateFormValues,
} from '../schemas/ecrf-template.schema';
import { useLookupSources } from './useLookupSources';
import { useUnsavedDraft } from './useUnsavedDraft';

export type EcrfFormMode = 'create' | 'edit';

interface EcrfTemplateFormOptions {
  mode: EcrfFormMode;
  templateId?: string;
  /** Called after a successful save (closes the drawer). */
  onDone: () => void;
}

const TABS = ['details', 'builder'] as const;
const FIELD_TABS = {
  name: 'details',
  productGroupId: 'details',
  description: 'details',
  status: 'details',
} as const;

const toFormValues = (t?: EcrfTemplate): EcrfTemplateFormValues => ({
  name: t?.name ?? '',
  productGroupId: t?.productGroupId ?? '',
  description: t?.description ?? '',
  status: t?.status ?? 'active',
});

/** Details tab (react-hook-form) + Form Builder tab (a controlled draft), saved together. */
export function useEcrfTemplateForm({ mode, templateId, onDone }: EcrfTemplateFormOptions) {
  const templates = useEcrfTemplatesStore((s) => s.templates);
  const addTemplate = useEcrfTemplatesStore((s) => s.addEcrfTemplate);
  const updateTemplate = useEcrfTemplatesStore((s) => s.updateEcrfTemplate);
  const template = templates.find((t) => t.id === templateId);
  const productGroupOptions = useMasterOptions('productGroup', template?.productGroupId);
  const { lookupSources, resolveLookup } = useLookupSources();
  const tabs = useFormTabs(TABS, FIELD_TABS);
  const builderRef = useRef<FormBuilderHandle>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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

  // Seeded once per template: a later store update (e.g. another tab saving) must not wipe
  // edits the user hasn't saved yet. `baseline` is the saved form JSON, to tell if anything changed.
  const entityId = template?.id ?? 'new';
  const seededIdRef = useRef(entityId);
  const [seed, setSeed] = useState(() => {
    const config = dbConfigToBuilderConfig(template?.config ?? null);
    return { draft: config, baseline: JSON.stringify(toDbConfig(config)) };
  });
  const [draft, setDraft] = useState<FormBuilderConfig>(seed.draft);
  useEffect(() => {
    if (seededIdRef.current === entityId) {
      return;
    }
    seededIdRef.current = entityId;
    const config = dbConfigToBuilderConfig(template?.config ?? null);
    setSeed({ draft: config, baseline: JSON.stringify(toDbConfig(config)) });
    setDraft(config);
  }, [entityId, template]);

  const isDraftDirty = useMemo(
    () => JSON.stringify(toDbConfig(draft)) !== seed.baseline,
    [draft, seed.baseline]
  );
  const isDirty = form.formState.isDirty || isDraftDirty;
  const unsaved = useUnsavedDraft({ entityId, form, draft, setDraft, isDirty });

  // Reusable keys come from saved records, not the draft, so the dropdowns don't shift while editing.
  const sectionKeyCatalog = useMemo(() => {
    if (mode !== 'edit') {
      return undefined;
    }
    return buildSectionKeyCatalog([
      { name: CATALOG_LAYER_NAMES.system, config: dbConfigToBuilderConfig(SYSTEM_DEFAULT_ECRF) },
      ...templates
        .filter((t) => t.id !== template?.id)
        .map((t) => ({
          name: CATALOG_LAYER_NAMES.template(t.name),
          config: dbConfigToBuilderConfig(t.config),
        })),
      { name: CATALOG_LAYER_NAMES.own, config: dbConfigToBuilderConfig(template?.config ?? null) },
    ]);
  }, [mode, templates, template]);

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

  const handleConfirmSave = () => {
    const values = form.getValues();
    const input = {
      name: values.name.trim(),
      productGroupId: values.productGroupId,
      description: values.description.trim() || undefined,
      status: values.status,
      config: toDbConfig(draft),
    };
    if (mode === 'create') {
      addTemplate(input);
      notify.success(L.created(input.name));
    } else if (template) {
      updateTemplate(template.id, input);
      notify.success(L.saved(input.name));
    }
    setIsConfirmOpen(false);
    unsaved.markSaved();
    onDone();
  };

  const name = form.watch('name')?.trim() || template?.name || '';

  return {
    isNotFound: mode === 'edit' && !template,
    title: mode === 'create' ? L.createTitle : L.editTitle,
    subtitle: mode === 'edit' ? template?.name : L.createDescription,
    tabs,
    form,
    productGroupOptions,
    draft,
    setDraft,
    builderRef,
    // A new template has no saved answers yet: keys simply follow the labels.
    keyMode: mode === 'create' ? ('auto' as const) : undefined,
    sectionKeyCatalog,
    lookupSources,
    resolveLookup,
    isDirty,
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
      onConfirm: handleConfirmSave,
      onCancel: () => setIsConfirmOpen(false),
    },
  };
}

export type EcrfTemplateFormModel = ReturnType<typeof useEcrfTemplateForm>;
