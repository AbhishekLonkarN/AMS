import type { AccountType, RecordStatus, UserType } from '@/types';

export const USER_TYPE_LABELS: Record<UserType, string> = {
  admin: 'AMS IT Admin',
  sponsor: 'Sponsor',
  co: 'CO / CRO',
  site: 'Site',
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  sponsor: 'Sponsor',
  co: 'CO / CRO',
};

export const RECORD_STATUS_LABELS: Record<RecordStatus, string> = {
  active: 'Active',
  inactive: 'In-active',
};

export const PREFIX_OPTIONS = ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.'] as const;

export const DESIGNATION_OPTIONS: Record<'sponsor' | 'co' | 'site', readonly string[]> = {
  sponsor: ['Head-Sponsor', 'Project Manager-Sponsor', 'CRA-Sponsor', 'QA Auditor', 'Data Manager'],
  co: ['Project Manager-CO', 'Assistant Project Manager-CO', 'CRA-CO'],
  site: ['Investigator', 'Sub-investigator', 'CRC'],
};
