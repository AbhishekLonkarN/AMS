import type { EtmfDocument, SiteContacts, SupportContacts } from '@/types';

export const ETMF_SEED: EtmfDocument[] = [];

const demoContact = (name: string, address: string) => ({ name, email: address + '@example.invalid', phone: '' });

export const SUPPORT_CONTACTS_SEED: SupportContacts[] = [{
  projectId: 'prj-restore',
  sponsorManager: { ...demoContact('Demo Sponsor Manager', 'sponsor'), organization: 'AMS Ltd.' },
  croName: 'Demo CRO',
  croManager: demoContact('Demo CRO Manager', 'cro-manager'),
  croAssistantManager: demoContact('Demo CRO Assistant Manager', 'cro-assistant'),
}];

export const SITE_CONTACTS_SEED: SiteContacts[] = [{
  siteId: 'site-restore-fr006',
  investigator: { email: 'investigator@example.invalid', phone: '' },
  smoName: 'Demo SMO',
  crc1: demoContact('Demo Coordinator', 'crc'),
  crc2: { name: '', email: '', phone: '' },
}];
