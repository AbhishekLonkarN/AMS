import type { Id, Site } from '@/types';
import { SITES_SEED } from '@/data/sites.seed';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { createId } from '@/utils/id.utils';
import { nowIso } from '@/utils/date.utils';
import { createAppStore } from './store.config';
import { recordAudit, recordFieldChanges, type AuditField } from './audit.store';
import { useSessionStore } from './session.store';
import { useMastersStore } from './masters.store';

export type SiteInput = Omit<Site, 'id' | 'createdAt' | 'createdBy' | 'actualRecruitment'>;

interface SitesState {
  sites: Site[];
  addSite: (input: SiteInput) => Site;
  updateSite: (id: Id, input: SiteInput) => void;
}

const masterLabel = (id?: Id) => useMastersStore.getState().items.find((i) => i.id === id)?.label ?? '—';

const SITE_AUDIT_FIELDS: AuditField<Site>[] = [
  { key: 'investigatorName', label: 'Investigator' },
  { key: 'investigatorEmail', label: 'Email' },
  { key: 'siteCode', label: 'Site ID' },
  { key: 'siteName', label: 'Site Name' },
  { key: 'location', label: 'Location' },
  { key: 'address', label: 'Complete Address' },
  { key: 'expectedRecruitment', label: 'Expected Recruitment' },
  { key: 'statusId', label: 'Site Status', format: masterLabel },
];

export const useSitesStore = createAppStore<SitesState>('sites', (set, get) => ({
  sites: SITES_SEED,

  addSite: (input) => {
    const site: Site = {
      ...input,
      id: createId('site'),
      actualRecruitment: 0,
      createdAt: nowIso(),
      createdBy: useSessionStore.getState().currentUserId ?? undefined,
    };
    set((s) => ({ sites: [...s.sites, site] }));
    recordAudit({
      page: AUDIT_PAGES.sites,
      event: `Created site ${site.siteCode} – ${site.siteName}`,
      changedTo: `${site.siteCode} / ${site.investigatorName}`,
      siteId: site.id,
    });
    return site;
  },

  updateSite: (id, input) => {
    const before = get().sites.find((s) => s.id === id);
    if (!before) return;
    const after = { ...before, ...input };
    set((s) => ({ sites: s.sites.map((x) => (x.id === id ? after : x)) }));
    recordFieldChanges({
      page: AUDIT_PAGES.sites,
      subject: `site ${before.siteCode}`,
      before,
      after,
      fields: SITE_AUDIT_FIELDS,
      context: { siteId: id },
    });
  },
}));
