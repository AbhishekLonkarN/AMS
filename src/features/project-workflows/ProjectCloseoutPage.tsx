import { closeoutReadiness } from './closeout.utils';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TextAreaField, TextField } from '@/components/form';
import { PageHeader } from '@/components/layout';
import { Modal } from '@/components/overlay';
import { notify, useParticipantsStore, useProjectsStore, useQueriesStore } from '@/store';
import { formatDate, formatTime } from '@/utils/date.utils';

const EMPTY_REASON = 'Enter a reason for the audit trail.';
const LOCK_STATEMENT = 'I confirm that the enrolment target is met, follow-up is complete for all enrolled participants, adverse events and queries are resolved, all required data is complete and reviewed, and site close-out is complete.';
const UNLOCK_STATEMENT = 'I confirm that I have obtained the required approvals to unlock this project database.';

export function ProjectCloseoutPage() {
  const { projectId = '' } = useParams();
  const project = useProjectsStore((state) => state.projects.find((item) => item.id === projectId));
  const setDatabaseLock = useProjectsStore((state) => state.setDatabaseLock);
  const queries = useQueriesStore((state) => state.queries);
  const participants = useParticipantsStore((state) => state.participants);
  const [open, setOpen] = useState(false);
  const [attested, setAttested] = useState(false);
  const [reason, setReason] = useState('');
  const [approval, setApproval] = useState('');
  const [error, setError] = useState('');
  if (!project) {return null;}
  const lock = project.databaseLock;
  const { participantCount, openQueries, incompleteForms, blocked } = closeoutReadiness(projectId, participants, queries);
  const close = () => { setOpen(false); setReason(''); setApproval(''); setError(''); setAttested(false); };
  const action = lock ? 'Unlock database' : 'Lock database';
  const save = () => {
    if (!reason.trim()) { setError(EMPTY_REASON); return; }
    if (!attested || (!lock && blocked)) {return;}
    if (!lock && closeoutReadiness(projectId, useParticipantsStore.getState().participants, useQueriesStore.getState().queries).blocked) {
      setError('Close-out readiness changed. Review the participant, query and form counts.');
      return;
    }
    const comment = lock && approval.trim() ? `${reason.trim()} (approval: ${approval.trim()})` : reason;
    const current = useProjectsStore.getState().projects.find((item) => item.id === projectId);
    if (!!current?.databaseLock !== !!lock || !setDatabaseLock(projectId, !lock, comment)) {
      setError('The database state changed. Close this dialog and review the current status.');
      return;
    }
    notify.success(lock ? 'Project database unlocked.' : 'Project database locked.');
    close();
  };

  return (
    <div className="page-container">
      <PageHeader title="Project Database Lock / Unlock" description={project.name}
        actions={<span className="badge badge-soft badge-primary">{lock ? 'Locked' : 'Open'}</span>} />
      <section className="section-card space-y-3">
        <h2 className="text-lg font-semibold">Close-out readiness</h2>
        <dl className="grid grid-cols-[1fr_auto] gap-2">
          <dt>Participants</dt><dd>{participantCount}</dd>
          <dt>Unresolved queries</dt><dd>{openQueries}</dd>
          <dt>Incomplete required or started forms</dt><dd>{incompleteForms}</dd>
        </dl>
        {lock && <p>Locked on {formatDate(lock.at)} at {formatTime(lock.at)}. {lock.reason}</p>}
        {!lock && blocked && <p role="status">{participantCount === 0 ? 'Register a participant before locking an empty project.' : 'Resolve open queries and submit incomplete forms before locking.'}</p>}
        <button className="btn btn-primary" type="button" disabled={!lock && blocked} onClick={() => setOpen(true)}>{action}</button>
      </section>
      <Modal isOpen={open} title={action} onClose={close} footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={close}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={!attested} onClick={save}>{action}</button>
        </>
      }>
        <div className="space-y-4">
          <label className="flex gap-3"><input type="checkbox" className="checkbox" checked={attested} onChange={(event) => setAttested(event.target.checked)} />
            <span>{lock ? UNLOCK_STATEMENT : LOCK_STATEMENT}</span>
          </label>
          <TextAreaField label="Reason" isRequired value={reason} error={error} onChange={(event) => { setReason(event.target.value); setError(''); }} />
          {lock && <TextField label="Approval reference" value={approval} onChange={(event) => setApproval(event.target.value)} />}
        </div>
      </Modal>
    </div>
  );
}
