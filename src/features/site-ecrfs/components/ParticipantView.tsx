import { Lock, LockOpen, MessageSquare, Pencil, X } from 'lucide-react';
import clsx from 'clsx';
import type { QueryStatus } from '@/types';
import { Modal } from '@/components/overlay';
import { PageHeader } from '@/components/layout';
import { TextAreaField } from '@/components/form';
import { QUERY_PANEL_LABELS as Q, SITE_ECRF_LABELS as L } from '../constants/site-ecrfs.constants';
import { QUERY_STATUS_LABELS } from '../utils/site-ecrfs.utils';
import { ParticipantDetailsModal } from './ParticipantDetailsModal';
import type { ParticipantViewModel } from '../hooks/useParticipantView';
import styles from './ParticipantView.module.css';

const LEGEND: (QueryStatus | 'none')[] = ['notRead', 'read', 'responded', 'resolved'];

/** Monitoring view of one participant's eCRF (read-only data, query panel, per-form lock). */
export function ParticipantView({ title, note, showProgress, backTo, identifiers, details, forms, form, entry, fields, panel }: ParticipantViewModel) {
  return (
    <div className="page-container">
      <PageHeader title={title} description={note} backTo={backTo} />
      <Modal isOpen={entry.correction.isOpen} title="Reason for correction" onClose={entry.correction.cancel}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={entry.correction.cancel}>Cancel</button>
            <button type="button" className="btn btn-primary" disabled={!entry.correction.reason.trim()} onClick={entry.correction.confirm}>Submit correction</button>
          </>
        }>
        <TextAreaField label="Reason" isRequired value={entry.correction.reason} onChange={(event) => entry.correction.setReason(event.target.value)} />
      </Modal>

      <section className="section-card flex flex-wrap items-start justify-between gap-4">
        <dl className={styles.identifiers}>
          {identifiers.map((item) => (
            <div key={item.label}>
              <dt className={styles.idLabel}>{item.label}</dt>
              <dd className={styles.idValue}>{item.value}</dd>
            </div>
          ))}
        </dl>
        {details && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={details.open}>
            <Pencil className="size-4" aria-hidden /> {L.editDetails}
          </button>
        )}
      </section>

      <div className={clsx(styles.layout, panel.isOpen && styles.layoutWithPanel)}>
        <nav className={styles.navigator} aria-label={L.navigator}>
          <p className={styles.navTitle}>{L.navigator}</p>
          {forms.map((f) => (
            <button
              key={f.key}
              type="button"
              className={clsx(styles.navItem, f.isActive && styles.navItemActive)}
              aria-current={f.isActive ? 'true' : undefined}
              disabled={f.isUnavailable}
              onClick={f.select}
            >
              <span className={styles.navText}>
                {f.label}
                {showProgress && <span className={styles.navProgress}>{f.progressLabel}</span>}
              </span>
              <span className={styles.navMeta}>
                {showProgress && f.openQueries > 0 && <span className={styles.badge}>{f.openQueries}</span>}
                {f.isLocked && <Lock className="size-4" aria-label="Locked" />}
              </span>
            </button>
          ))}
        </nav>

        <section className={styles.content}>
          <div className={styles.contentHead}>
            <div>
              <h2 className={styles.formTitle}>{form.label}</h2>
              {showProgress && <p className={styles.idLabel}>{form.progressLabel}</p>}
            </div>
            {form.canLock && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={form.toggleLock}>
                {form.isLocked ? <LockOpen className="size-4" aria-hidden /> : <Lock className="size-4" aria-hidden />}
                {form.isLocked ? L.unlock : L.lock}
              </button>
            )}
          </div>

          {form.isLocked && (
            <p className={styles.lockNote} role="status">
              <Lock className="size-4 shrink-0" aria-hidden />
              <span>
                <strong>{form.lockedText}.</strong> {form.lockedNote}
              </span>
            </p>
          )}

          <ul className={styles.fieldList}>
            {fields.map((field) => (
              <li key={field.key} className={clsx(styles.field, field.isSelected && styles.fieldSelected)}>
                <label className={styles.fieldLabel} htmlFor={field.isEditable ? `field-${field.key}` : undefined}>
                  {field.label}
                  {field.isEditable && field.required && <span className="text-status-error"> *</span>}
                </label>
                <span className={styles.fieldValue}>
                  {field.isEditable ? (
                    <span className={styles.inputWrap}>
                      <span className={styles.inputRow}>
                        <ClinicalInput field={field} />
                        {field.unit && <span className={clsx(styles.unit, 'shrink-0')}>{field.unit}</span>}
                      </span>
                      {field.error && <span className={styles.fieldError}>{field.error}</span>}
                    </span>
                  ) : field.value ? (
                    <>
                      {field.value}
                      {field.unit && <span className={styles.unit}>{field.unit}</span>}
                    </>
                  ) : (
                    <span className={styles.empty}>{L.emptyValue}</span>
                  )}
                </span>
                {field.showMarker && (
                  <button
                    type="button"
                    className={styles.marker}
                    data-status={field.queryStatus}
                    title={field.queryStatus ? QUERY_STATUS_LABELS[field.queryStatus] : L.legend.none}
                    aria-label={`${Q.title}: ${field.label} (${field.queryStatus ? QUERY_STATUS_LABELS[field.queryStatus] : L.legend.none})`}
                    aria-pressed={field.isSelected}
                    onClick={field.select}
                  >
                    <MessageSquare className="size-4" aria-hidden />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {entry.isEnabled && (
            <div className={styles.saveBar}>
              <fieldset className={styles.saveModes}>
                <legend className={styles.idLabel}>{L.saveModeTitle}</legend>
                {entry.modes.map((m) => (
                  <label key={m.value} className={styles.saveMode}>
                    <input
                      type="radio"
                      name="save-mode"
                      className="radio radio-sm"
                      checked={entry.mode === m.value}
                      onChange={() => entry.setMode(m.value)}
                    />
                    {m.label}
                  </label>
                ))}
              </fieldset>
              <button type="button" className="btn btn-primary" onClick={entry.save}>
                {L.submitButton}
              </button>
            </div>
          )}

          <p className={styles.legend}>
            <strong>{L.legend.title}:</strong>
            {LEGEND.map((status) => (
              <span key={status} className={styles.legendItem}>
                <span className={styles.dot} data-status={status} aria-hidden />
                {L.legend[status as QueryStatus]}
              </span>
            ))}
          </p>
        </section>

        {panel.isOpen && (
          <aside className={styles.panel} aria-label={Q.title}>
            <div className={styles.panelHead}>
              <div>
                <h3 className={styles.panelTitle}>{panel.fieldLabel}</h3>
                <p className={styles.panelMeta}>{panel.formLabel}</p>
              </div>
              <button type="button" className="btn btn-ghost btn-square btn-xs" aria-label={Q.close} onClick={panel.close}>
                <X className="size-4" aria-hidden />
              </button>
            </div>

            {panel.queries.map((q) => (
              <article key={q.id} className={styles.thread}>
                <span className={styles.statusPill}>
                  <span className={styles.dot} data-status={q.status} aria-hidden />
                  {QUERY_STATUS_LABELS[q.status]}
                </span>
                <p className={styles.threadText}>{q.text}</p>
                {q.response ? (
                  <div>
                    <p className={styles.panelMeta}>{Q.response}</p>
                    <p className={styles.threadResponse}>{q.response}</p>
                  </div>
                ) : (
                  <p className={styles.note}>{Q.noResponse}</p>
                )}
                <p className={styles.threadMeta}>
                  <span>
                    {Q.raisedBy} {q.raisedBy}
                  </span>
                  <span>{q.raisedAt}</span>
                </p>
              </article>
            ))}

            {panel.canRespond && (
              <div className="flex flex-col gap-2">
                <TextAreaField
                  label={Q.responseText}
                  isRequired
                  rows={4}
                  value={panel.responseDraft}
                  placeholder={Q.responsePlaceholder}
                  error={panel.responseError}
                  onChange={(e) => panel.setResponseDraft(e.target.value)}
                />
                <button type="button" className="btn btn-primary btn-sm self-end" onClick={panel.respond}>
                  {Q.respond}
                </button>
              </div>
            )}
            {panel.respondBlockedReason && <p className={styles.note}>{panel.respondBlockedReason}</p>}

            {panel.canResolve && (
              <button type="button" className="btn btn-primary btn-sm" onClick={panel.resolve}>
                {Q.resolve}
              </button>
            )}

            {panel.canRaise ? (
              <div className="flex flex-col gap-2">
                <TextAreaField
                  label={Q.queryText}
                  isRequired
                  rows={4}
                  value={panel.draft}
                  placeholder={Q.queryPlaceholder}
                  error={panel.draftError}
                  onChange={(e) => panel.setDraft(e.target.value)}
                />
                <button type="button" className="btn btn-primary btn-sm self-end" onClick={panel.raise}>
                  {Q.raise}
                </button>
              </div>
            ) : (
              panel.raiseBlockedReason &&
              panel.queries.length === 0 && <p className={styles.note}>{panel.raiseBlockedReason}</p>
            )}
          </aside>
        )}
      </div>
      {details && <ParticipantDetailsModal {...details} />}
    </div>
  );
}

function ClinicalInput({ field }: { field: ParticipantViewModel['fields'][number] }) {
  const common = { id: `field-${field.key}`, 'aria-invalid': !!field.error };
  if (field.type === 'checkbox') {
    return <input {...common} className="checkbox checkbox-sm" type="checkbox" checked={field.inputValue === 'Yes'} onChange={(event) => field.onChange(event.target.checked ? 'Yes' : 'No')} />;
  }
  if (field.type === 'select' || field.type === 'multiselect') {
    const multiple = field.type === 'multiselect';
    return (
      <select
        {...common}
        className="select select-sm w-full"
        multiple={multiple}
        value={multiple ? field.inputValue.split('\n').filter(Boolean) : field.inputValue}
        onChange={(event) => field.onChange(multiple ? [...event.target.selectedOptions].map((option) => option.value).join('\n') : event.target.value)}
      >
        {!multiple && <option value="">Select an option</option>}
        {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    );
  }
  if (field.type === 'textarea' || field.type === 'address') {
    return <textarea {...common} className="textarea textarea-sm w-full" value={field.inputValue} onChange={(event) => field.onChange(event.target.value)} />;
  }
  const types = { number: 'number', currency: 'number', date: 'date', datetime: 'datetime-local', email: 'email', phone: 'tel' } as const;
  const type = Object.prototype.hasOwnProperty.call(types, field.type) ? types[field.type as keyof typeof types] : 'text';
  return <input {...common} className={clsx('input input-sm w-full', field.error && 'input-error')} type={type} step={type === 'number' ? 'any' : undefined} value={field.inputValue} onChange={(event) => field.onChange(event.target.value)} />;
}
