import type { Id, SiteContacts, SupportContacts } from '@/types';
import { SITE_CONTACTS_SEED, SUPPORT_CONTACTS_SEED } from '@/data/site-documents.seed';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { createAppStore } from './store.config';
import { recordAudit } from './audit.store';

interface ContactsState {
  /** One support card per project. A deleted card is removed until it is added again. */
  supportContacts: SupportContacts[];
  /** One contact card per site (maintained by the site user; sponsor and CO users read it). */
  siteContacts: SiteContacts[];
  saveSupportContacts: (card: SupportContacts) => void;
  deleteSupportContacts: (projectId: Id) => void;
  saveSiteContacts: (card: SiteContacts) => void;
}

export const useContactsStore = createAppStore<ContactsState>('contacts', (set, get) => ({
  supportContacts: SUPPORT_CONTACTS_SEED,
  siteContacts: SITE_CONTACTS_SEED,

  saveSupportContacts: (card) => {
    const isNew = !get().supportContacts.some((c) => c.projectId === card.projectId);
    set((s) => ({
      supportContacts: isNew
        ? [...s.supportContacts, card]
        : s.supportContacts.map((c) => (c.projectId === card.projectId ? card : c)),
    }));
    recordAudit({
      page: AUDIT_PAGES.supportContacts,
      event: isNew ? 'Added support contacts' : 'Edited support contacts',
      changedTo: card.sponsorManager.email,
      projectId: card.projectId,
    });
  },

  saveSiteContacts: (card) => {
    const isNew = !get().siteContacts.some((c) => c.siteId === card.siteId);
    set((s) => ({
      siteContacts: isNew ? [...s.siteContacts, card] : s.siteContacts.map((c) => (c.siteId === card.siteId ? card : c)),
    }));
    recordAudit({
      page: AUDIT_PAGES.siteContacts,
      event: isNew ? 'Added site contacts' : 'Edited site contacts',
      changedTo: card.crc1.email || card.investigator.email,
      siteId: card.siteId,
    });
  },

  deleteSupportContacts: (projectId) => {
    set((s) => ({ supportContacts: s.supportContacts.filter((c) => c.projectId !== projectId) }));
    recordAudit({
      page: AUDIT_PAGES.supportContacts,
      event: 'Deleted support contacts',
      changedTo: 'Removed',
      projectId,
    });
  },
}));
