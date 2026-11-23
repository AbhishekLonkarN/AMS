import { useState } from 'react';
import { PageHeader } from '@/components/layout';
import { SelectField } from '@/components/form';
import { usePermission } from '@/rbac';
import { notify } from '@/store';
import { CREDENTIAL_OPTIONS, useAdminSettings } from './settings.store';

export function CredentialSettingsPage() {
  const saved = useAdminSettings((s) => s.credentials);
  const saveCredentials = useAdminSettings((s) => s.saveCredentials);
  const [settings, setSettings] = useState(saved);
  const canEdit = usePermission('cloudSettings.edit');
  return (
    <div className="page-container">
      <PageHeader title="Login Credential Settings" description="Demo settings and audit entries are available for this session." />
      <form className="section-card space-y-4" onSubmit={(event) => {
        event.preventDefault();
        if (!canEdit) {return;}
        saveCredentials(settings);
        notify.success('Credential settings saved for this demo session.');
      }}>
        <fieldset className="space-y-3" disabled={!canEdit}>
          <legend className="text-lg font-semibold">Authentication policies</legend>
          {CREDENTIAL_OPTIONS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3">
              <input className="checkbox checkbox-primary" type="checkbox" checked={settings[key]}
                onChange={(event) => setSettings({ ...settings, [key]: event.target.checked })} />
              <span>{label}</span>
            </label>
          ))}
          {settings.passwordExpiry && <SelectField label="Password expiry in days" value={settings.expiryDays}
            onChange={(event) => setSettings({ ...settings, expiryDays: event.target.value })}
            options={['30', '60', '90', '180'].map((value) => ({ value, label: value }))} />}
        </fieldset>
        {canEdit && <button type="submit" className="btn btn-primary">Save settings</button>}
      </form>
      <section className="section-card space-y-2">
        <h2 className="text-lg font-semibold">Production authentication rules</h2>
        <ul className="list-disc space-y-1 ps-5">
          <li>Welcome and reset links go to the registered email.</li>
          <li>Three consecutive failed logins lock the account for one hour. Failed attempts generate an email and record the attempt origin.</li>
          <li>Recognized computers skip OTP. A sign-in on a second computer ends the first session.</li>
          <li>Saving or submitting an eCRF requires re-authentication.</li>
        </ul>
        <p className="text-sm text-ink-600">Password length remains open in AMS PRD item OQ-84. Authentication enforcement and email delivery require backend integration.</p>
      </section>
    </div>
  );
}
