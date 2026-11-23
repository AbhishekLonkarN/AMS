import { useState } from 'react';
import { PageHeader } from '@/components/layout';
import { SelectField, TextAreaField, TextField } from '@/components/form';
import { ConfirmDialog } from '@/components/feedback';
import { usePermission } from '@/rbac';
import { notify } from '@/store';
import { formatDate, formatTime, nowIso } from '@/utils/date.utils';
import { useAdminSettings } from './settings.store';

const FREQUENCIES = [
  { value: 'once', label: 'Once' }, { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'On selected weekdays' }, { value: 'monthly', label: 'On a day of the month' },
  { value: 'custom', label: 'Custom interval' },
];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function BackupPage() {
  const saved = useAdminSettings((s) => s.schedule);
  const runs = useAdminSettings((s) => s.runs);
  const saveSchedule = useAdminSettings((s) => s.saveSchedule);
  const completeBackup = useAdminSettings((s) => s.completeBackup);
  const simulateRestore = useAdminSettings((s) => s.simulateRestore);
  const canEdit = usePermission('cloudSettings.edit');
  const [settings, setSettings] = useState(saved);
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [runId, setRunId] = useState('');
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState(false);
  const restorePoint = runs.find((run) => run.id === runId);
  const change = (patch: Partial<typeof settings>) => {
    setSettings({ ...settings, ...patch });
    setError('');
  };
  const startBackup = () => {
    if (isRunning || !canEdit) {return;}
    const startedAt = nowIso();
    setIsRunning(true);
    window.setTimeout(() => {
      completeBackup(startedAt);
      setIsRunning(false);
      notify.success('Demo backup completed. A restore point is available.');
    }, 500);
  };

  return (
    <div className="page-container">
      <PageHeader title="Back-up and Restore" description="Demo only. Schedules, backups and restore points simulate the workflow without copying or changing clinical data." />
      <form className="section-card space-y-3" onSubmit={(event) => {
        event.preventDefault();
        if (!canEdit) {return;}
        if (!settings.destination.trim()) { setError('Enter a backup destination.'); return; }
        if (settings.enabled && !settings.time) { setError('Choose the date and time of the first run.'); return; }
        if (settings.enabled && settings.frequency === 'weekly' && !settings.days.length) { setError('Select at least one weekday.'); return; }
        saveSchedule({ ...settings, destination: settings.destination.trim() });
        notify.success('Demo backup settings saved.');
      }}>
        <fieldset disabled={!canEdit} className="space-y-4">
          <legend className="text-lg font-semibold">Automatic backup</legend>
          <TextField label="Backup destination" isRequired value={settings.destination} onChange={(event) => change({ destination: event.target.value })} />
          <label className="flex items-center gap-3">
            <input type="checkbox" className="checkbox checkbox-primary" checked={settings.enabled}
              onChange={(event) => change({ enabled: event.target.checked })} /> Enable scheduler
          </label>
          {settings.enabled && (
            <div className="form-grid">
              <TextField label="First run" type="datetime-local" value={settings.time} isRequired
                onChange={(event) => change({ time: event.target.value })} />
              <SelectField label="Frequency" value={settings.frequency} options={FREQUENCIES}
                onChange={(event) => change({ frequency: event.target.value })} />
              {settings.frequency === 'weekly' && (
                <fieldset className="flex flex-wrap gap-3">
                  <legend className="mb-2 font-semibold">Run on</legend>
                  {DAYS.map((day) => <label key={day} className="flex items-center gap-2">
                    <input type="checkbox" className="checkbox checkbox-sm" checked={settings.days.includes(day)}
                      onChange={(event) => change({ days: event.target.checked ? [...settings.days, day] : settings.days.filter((item) => item !== day) })} /> {day}
                  </label>)}
                </fieldset>
              )}
              {settings.frequency === 'monthly' && <TextField label="Day of month" type="number" min={1} max={31} required value={settings.monthDay}
                onChange={(event) => change({ monthDay: event.target.value })} />}
              {settings.frequency === 'custom' && <TextField label="Repeat every (days)" type="number" min={1} required value={settings.intervalDays}
                onChange={(event) => change({ intervalDays: event.target.value })} />}
            </div>
          )}
        </fieldset>
        {error && <p role="alert" className="text-error">{error}</p>}
        {canEdit && <button type="submit" className="btn btn-primary">Save schedule</button>}
      </form>
      <section className="section-card space-y-3">
        <h2 className="text-lg font-semibold">Manual backup</h2>
        {canEdit && <button type="button" className="btn btn-primary" disabled={isRunning} onClick={startBackup}>Start now</button>}
        <p role="status">{isRunning ? 'Simulating backup…' : runs.length ? 'Latest demo backup completed.' : 'No manual backups in this session.'}</p>
      </section>
      <section className="section-card space-y-3">
        <h2 className="text-lg font-semibold">Restore</h2>
        <SelectField label="Restore point" value={runId} disabled={!canEdit || !runs.length}
          options={runs.map((run, index) => ({ value: run.id, label: `Backup ${runs.length - index} · ${formatDate(run.completedAt)} ${formatTime(run.completedAt)}` }))}
          onChange={(event) => setRunId(event.target.value)} />
        <TextAreaField label="Reason for restore" value={reason} disabled={!canEdit} onChange={(event) => setReason(event.target.value)} />
        {canEdit && <button type="button" className="btn btn-primary" disabled={!restorePoint || !reason.trim()} onClick={() => setConfirm(true)}>Review restore</button>}
      </section>
      <ConfirmDialog isOpen={confirm} title="Confirm demo restore"
        message={restorePoint ? `Restore point: ${formatDate(restorePoint.completedAt)} ${formatTime(restorePoint.completedAt)}. A production restore would replace later data.` : ''}
        confirmLabel="Simulate restore" onCancel={() => setConfirm(false)} onConfirm={() => {
          if (!canEdit || !restorePoint || !reason.trim()) {return;}
          simulateRestore(restorePoint, reason);
          setConfirm(false);
          setReason('');
          notify.success('Demo restore audited.');
        }} />
    </div>
  );
}
