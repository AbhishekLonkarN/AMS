import type { CompanyProfile } from '@/types';
import { COMPANY_PROFILE_SEED } from '@/data/company-profile.seed';
import { AUDIT_PAGES } from '@/constants/audit.constants';
import { createAppStore } from './store.config';
import { recordFieldChanges, type AuditField } from './audit.store';

interface CompanyProfileState {
  profile: CompanyProfile;
  updateProfile: (input: CompanyProfile) => void;
}

const PROFILE_AUDIT_FIELDS: AuditField<CompanyProfile>[] = [
  { key: 'ownerDisplayName', label: 'Name of Owner Company to Appear' },
  { key: 'legalName', label: 'Legal Name of Owner Company' },
  { key: 'address', label: 'Address' },
  { key: 'itAdminName', label: 'Name of IT Admin' },
  { key: 'itAdminUserId', label: 'User ID of IT Admin' },
  { key: 'softwareName', label: 'Name of this Software System' },
  { key: 'logoFileName', label: 'Logo' },
];

export const useCompanyProfileStore = createAppStore<CompanyProfileState>('company-profile', (set, get) => ({
  profile: COMPANY_PROFILE_SEED,

  updateProfile: (input) => {
    const before = get().profile;
    set({ profile: input });
    recordFieldChanges({
      page: AUDIT_PAGES.companyProfile,
      subject: 'company profile',
      before,
      after: input,
      fields: PROFILE_AUDIT_FIELDS,
    });
  },
}));
