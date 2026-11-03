import { useId, useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Site } from '@/types';
import { notify, useSitesStore } from '@/store';
import { isSameText } from '@/utils/string.utils';
import { useMasterOptions } from '@/features/masters';
import { SITE_LABELS as L, SITE_VALIDATION } from '../constants/sites.constants';
import { buildSiteSchema, type SiteFormValues } from '../schemas/site.schema';

export type FormMode = 'create' | 'edit';

interface SiteFormOptions {
  mode: FormMode;
  projectId: string;
  siteId?: string;
  /** Called after a successful save (closes the drawer). */
  onDone: () => void;
}

const toFormValues = (s?: Site) =>
  ({
    investigatorName: s?.investigatorName ?? '',
    investigatorEmail: s?.investigatorEmail ?? '',
    siteCode: s?.siteCode ?? '',
    siteName: s?.siteName ?? '',
    location: s?.location ?? '',
    address: s?.address ?? '',
    expectedRecruitment: s?.expectedRecruitment ?? '',
    statusId: s?.statusId ?? '',
  }) as unknown as SiteFormValues;

/** Create and Edit share this hook and one drawer form view. */
export function useSiteForm({ mode, projectId, siteId, onDone }: SiteFormOptions) {
  const sites = useSitesStore((s) => s.sites);
  const addSite = useSitesStore((s) => s.addSite);
  const updateSite = useSitesStore((s) => s.updateSite);
  const formId = useId();
  const site = sites.find((s) => s.id === siteId && s.projectId === projectId);

  const resolver = useMemo<Resolver<SiteFormValues>>(() => {
    const others = sites.filter((s) => s.projectId === projectId && s.id !== site?.id);
    const zod = zodResolver(buildSiteSchema((code) => others.some((s) => isSameText(s.siteCode, code))));

    // Investigator + Email must be unique within the project; checked even when other fields fail.
    return async (values, context, options) => {
      const result = await zod(values, context, options);
      const isComboTaken =
        !!values.investigatorName?.trim() &&
        others.some(
          (s) => isSameText(s.investigatorName, values.investigatorName) && isSameText(s.investigatorEmail, values.investigatorEmail),
        );
      if (!isComboTaken || result.errors.investigatorEmail) return result;
      return {
        values: {},
        errors: { ...result.errors, investigatorEmail: { type: 'unique', message: SITE_VALIDATION.investigatorTaken } },
      };
    };
  }, [sites, projectId, site?.id]);

  const form = useForm<SiteFormValues>({ resolver, defaultValues: toFormValues(site) });
  const statusOptions = useMasterOptions('siteStatus', site?.statusId);

  const handleSubmit = form.handleSubmit((values) => {
    const input = { ...values, projectId, siteCode: values.siteCode.trim().toUpperCase() };
    if (mode === 'create') {
      addSite(input);
      notify.success(L.created(input.siteCode));
    } else if (site) {
      updateSite(site.id, input);
      notify.success(L.saved(input.siteCode));
    }
    onDone();
  });

  return {
    isNotFound: mode === 'edit' && !site,
    title: mode === 'create' ? L.createTitle : L.editTitle,
    subtitle: site ? `${site.siteCode} · ${site.siteName}` : L.createDescription,
    submitLabel: mode === 'create' ? L.submitCreate : L.submitEdit,
    formId,
    form,
    statusOptions,
    handleSubmit,
  };
}

export type SiteFormModel = ReturnType<typeof useSiteForm>;
