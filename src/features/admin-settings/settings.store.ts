import { AUDIT_PAGES } from '@/constants/audit.constants';
import { recordAudit, recordFieldChanges } from '@/store';
import { createAppStore } from '@/store/store.config';
import { nowIso } from '@/utils/date.utils';
import { createId } from '@/utils/id.utils';

export const CREDENTIAL_OPTIONS = [
  { key: 'passwordSpec', label: 'Mandatory password specification' },
  { key: 'emailOtp', label: 'Email OTP on a new computer' },
  { key: 'passwordExpiry', label: 'Password expiry' },
  { key: 'resetLimit', label: 'One password reset request per 24 hours' },
] as const;

type CredentialSettings = Record<typeof CREDENTIAL_OPTIONS[number]['key'], boolean> & { expiryDays: string };
export type BackupSchedule = { destination: string; enabled: boolean; time: string; frequency: string; days: string[]; monthDay: string; intervalDays: string };
type BackupRun = { id: string; startedAt: string; completedAt: string };

interface SettingsState {
  credentials: CredentialSettings;
  schedule: BackupSchedule;
  runs: BackupRun[];
  saveCredentials: (credentials: CredentialSettings) => void;
  saveSchedule: (schedule: BackupSchedule) => void;
  completeBackup: (startedAt: string) => void;
  simulateRestore: (run: BackupRun, reason: string) => void;
}

export const useAdminSettings = createAppStore<SettingsState>('admin-settings', (set, get) => ({
  credentials: { passwordSpec: true, emailOtp: false, passwordExpiry: false, expiryDays: '90', resetLimit: true },
  schedule: { destination: 'AMS managed storage (demo)', enabled: false, time: '', frequency: 'daily', days: [], monthDay: '1', intervalDays: '7' },
  runs: [],
  saveCredentials: (credentials) => {
    recordFieldChanges({
      page: AUDIT_PAGES.credentialSettings,
      subject: 'credential settings',
      before: get().credentials,
      after: credentials,
      fields: [...CREDENTIAL_OPTIONS, { key: 'expiryDays', label: 'Password expiry in days' }],
    });
    set({ credentials });
  },
  saveSchedule: (schedule) => {
    recordFieldChanges({
      page: AUDIT_PAGES.backup,
      subject: 'backup settings',
      before: get().schedule,
      after: schedule,
      fields: [
        { key: 'destination', label: 'Backup destination' }, { key: 'enabled', label: 'Enable scheduler' },
        { key: 'time', label: 'First run' }, { key: 'frequency', label: 'Frequency' },
        { key: 'days', label: 'Weekdays', format: (days) => Array.isArray(days) ? days.join(', ') : '' },
        { key: 'monthDay', label: 'Day of month' }, { key: 'intervalDays', label: 'Custom interval' },
      ],
    });
    set({ schedule });
  },
  completeBackup: (startedAt) => {
    const completedAt = nowIso();
    const run = { id: createId('backup'), startedAt, completedAt };
    set((s) => ({ runs: [run, ...s.runs] }));
    recordAudit({ page: AUDIT_PAGES.backup, event: 'Completed manual demo backup', originalValue: startedAt, changedTo: completedAt });
  },
  simulateRestore: (run, reason) => {
    recordAudit({ page: AUDIT_PAGES.backup, event: 'Simulated restore', originalValue: run.completedAt, changedTo: reason.trim() });
  },
}));
