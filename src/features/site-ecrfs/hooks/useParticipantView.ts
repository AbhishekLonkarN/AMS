import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import type { DataQuery } from '@/types';
import { notify, useParticipantsStore, useProjectsStore, useQueriesStore, useUsersStore } from '@/store';
import { usePermission } from '@/rbac';
import { useCurrentContext } from '@/features/shell';
import { useMasterLabel } from '@/features/masters';
import { userNameById } from '@/features/user-common';
import { canOpenClinicalForm, clinicalForms, validateClinicalValue } from '@/features/project-workflows/project-ecrf.utils';
import { paths } from '@/app/router/route-paths.constants';
import { formatDate, formatTime } from '@/utils/date.utils';
import { QUERY_PANEL_LABELS as Q, SITE_ECRF_LABELS as L } from '../constants/site-ecrfs.constants';
import { openQueryOf } from '../utils/site-ecrfs.utils';
import { useParticipantDetailsForm } from './useParticipantDetailsForm';

const whenText = (iso: string) => `${formatDate(iso)} ${formatTime(iso)}`;

export type SaveMode = 'draft' | 'soft' | 'submit';

/**
 * One participant's eCRF: identifiers, form navigator, form content, query panel.
 * Sponsor and CO users review it (raise / resolve queries, lock); site users enter the data
 * (Draft Save, Soft Submit, Submit) and respond to queries.
 */
export function useParticipantView() {
  const { projectId = '', siteId = '', participantId = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const participant = useParticipantsStore((s) => s.participants.find((p) => p.id === participantId && p.siteId === siteId && p.projectId === projectId));
  const databaseLocked = useProjectsStore((s) => !!s.projects.find((p) => p.id === projectId)?.databaseLock);
  const definitions = useMemo(() => clinicalForms(participant?.ecrfDesign), [participant?.ecrfDesign]);
  const lockForm = useParticipantsStore((s) => s.lockForm);
  const unlockForm = useParticipantsStore((s) => s.unlockForm);
  const saveForm = useParticipantsStore((s) => s.saveForm);
  const queries = useQueriesStore((s) => s.queries);
  const raiseQuery = useQueriesStore((s) => s.raiseQuery);
  const resolveQuery = useQueriesStore((s) => s.resolveQuery);
  const markQueryRead = useQueriesStore((s) => s.markQueryRead);
  const respondQuery = useQueriesStore((s) => s.respondQuery);
  const users = useUsersStore((s) => s.users);
  const { user } = useCurrentContext();
  const statusLabel = useMasterLabel();
  const details = useParticipantDetailsForm({ siteId, participant });
  const [draft, setDraft] = useState('');
  const [draftError, setDraftError] = useState('');
  const [responseDraft, setResponseDraft] = useState('');
  const [responseError, setResponseError] = useState('');
  const [edits, setEdits] = useState<{ scope: string; values: Record<string, string> } | null>(null);
  const [mode, setMode] = useState<SaveMode>('draft');
  const [correction, setCorrection] = useState<{ scope: string; reason: string }>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const canLock = usePermission('siteEcrfs.lock');
  const canRaise = usePermission('siteEcrfQuery.new');
  const canEnterData = usePermission('siteEcrfs.edit');
  const canDraftSave = usePermission('siteEcrfs.draftSave');
  const canSubmit = usePermission('siteEcrfs.submit');
  const canRespond = usePermission('siteEcrfQuery.respond');
  // Only a sponsor or CO user may resolve a query, by user class and not by permission alone.
  const canResolve = usePermission('siteEcrfQuery.edit') && (user?.userType === 'sponsor' || user?.userType === 'co');

  const requestedForm = searchParams.get('form');
  const requestedDefinition = definitions.find((definition) => definition.key === requestedForm);
  const canNavigate = (key: string) => !!participant && (!canEnterData || canOpenClinicalForm(participant, key));
  const formKey = requestedDefinition && canNavigate(requestedDefinition.key) ? requestedDefinition.key : definitions[0]?.key ?? '';
  const fieldKey = searchParams.get('field') ?? '';
  const scope = `${participantId}:${formKey}`;

  // The query on the selected field, if any. A site user opening an unread one marks it read.
  const selectedQueries = useMemo(
    () =>
      fieldKey
        ? queries
            .filter((q) => q.participantId === participantId && q.formKey === formKey && q.fieldKey === fieldKey)
            .sort((a, b) => b.raisedAt.localeCompare(a.raisedAt))
        : [],
    [queries, participantId, formKey, fieldKey],
  );
  const openQuery = openQueryOf(selectedQueries);
  useEffect(() => {
    if (!databaseLocked && canRespond && openQuery?.status === 'notRead') {markQueryRead(openQuery.id);}
  }, [databaseLocked, canRespond, openQuery?.id, openQuery?.status, markQueryRead]);

  return useMemo(() => {
    if (!participant) {return null;}
    const own = queries.filter((q) => q.participantId === participant.id);
    const formDef = definitions.find((definition) => definition.key === formKey);
    if (!formDef) return null;
    const instance = participant.forms.find((f) => f.formKey === formKey);
    const isLocked = !!instance?.lock;
    const isEntry = canEnterData && !!instance && !isLocked && !databaseLocked;
    const reviewValues = instance?.submittedValues ?? (instance?.progress === 'submitted' ? instance.values : {});
    const currentValues = { ...(instance?.values ?? {}), ...(edits?.scope === scope ? edits.values : {}) };

    const resetPanel = () => {
      setDraft('');
      setDraftError('');
      setResponseDraft('');
      setResponseError('');
    };

    const select = (nextForm: string, nextField?: string) => {
      resetPanel();
      setFieldErrors({});
      setSearchParams(nextField ? { form: nextForm, field: nextField } : { form: nextForm }, { replace: true });
    };

    const forms = participant.forms.map((f) => ({
      key: f.formKey,
      label: definitions.find((definition) => definition.key === f.formKey)?.label ?? f.formKey,
      isUnavailable: canEnterData && !canOpenClinicalForm(participant, f.formKey),
      progress: f.progress,
      progressLabel: f.progress === 'notStarted' ? L.notStarted : f.progress === 'draft' ? L.draft : f.progress === 'softSubmitted' ? 'Soft submitted' : L.submitted,
      isLocked: !!f.lock,
      isActive: f.formKey === formKey,
      openQueries: own.filter((q) => q.formKey === f.formKey && q.status !== 'resolved').length,
      select: () => select(f.formKey),
    }));

    const fields = formDef.fields.map((field) => {
      const fieldQueries = own.filter((q) => q.formKey === formKey && q.fieldKey === field.key);
      const latest = [...fieldQueries].sort((a, b) => b.raisedAt.localeCompare(a.raisedAt))[0];
      // Reviewers can raise a query on any started form. Site users only see the markers of queries they must answer.
      const showMarker = (instance?.progress ?? 'notStarted') !== 'notStarted' && (canRaise || !canEnterData || !!latest);
      return {
        key: field.key,
        label: field.label,
        unit: field.unit,
        value: (canEnterData ? instance?.values : reviewValues)?.[field.key] ?? '',
        type: field.type, options: field.options, required: field.required,
        inputValue: currentValues[field.key] ?? '',
        error: fieldErrors[field.key],
        isEditable: isEntry,
        onChange: (value: string) => {
          setEdits({ scope, values: { ...currentValues, [field.key]: value } });
          if (fieldErrors[field.key]) {setFieldErrors((e) => ({ ...e, [field.key]: '' }));}
        },
        showMarker,
        queryStatus: latest?.status,
        isSelected: field.key === fieldKey,
        select: () => select(formKey, field.key),
      };
    });

    const selectedDef = formDef.fields.find((f) => f.key === fieldKey);

    const describe = (q: DataQuery) => ({
      id: q.id,
      status: q.status,
      text: q.text,
      response: q.response,
      raisedBy: userNameById(users, q.raisedBy),
      raisedAt: whenText(q.raisedAt),
    });

    let raiseBlockedReason = '';
    if (!canRaise) {raiseBlockedReason = canRespond ? Q.noQuery : Q.cannotRaise;}
    else if (isLocked || databaseLocked || (instance?.progress !== 'submitted' && !instance?.submittedValues)) {raiseBlockedReason = Q.lockedForm;}
    else if (openQuery) {raiseBlockedReason = Q.openExists;}

    const isAnswerable = !!openQuery && (openQuery.status === 'notRead' || openQuery.status === 'read');

    const handleRaise = () => {
      if (!draft.trim()) {
        setDraftError(Q.required);
        return;
      }
      if (raiseQuery({ participantId: participant.id, formKey, fieldKey, text: draft })) {
        setDraft('');
        setDraftError('');
        notify.success(Q.raised);
      }
    };

    const handleResolve = () => {
      if (!openQuery) {return;}
      if (resolveQuery(openQuery.id)) notify.success(Q.resolvedToast);
    };

    const handleRespond = () => {
      if (!openQuery) {return;}
      if (!responseDraft.trim()) {
        setResponseError(Q.responseRequired);
        return;
      }
      if (respondQuery(openQuery.id, responseDraft)) {
        setResponseDraft('');
        setResponseError('');
        notify.success(Q.responded);
      }
    };

    const handleToggleLock = () => {
      if (isLocked) {
        if (unlockForm(participant.id, formKey)) notify.success(L.unlocked(formDef.label));
      } else {
        if (lockForm(participant.id, formKey)) notify.success(L.locked(formDef.label));
      }
    };

    // Soft Submit advances the workflow without committing the reviewed data.
    const modes: { value: SaveMode; label: string }[] = [
      ...(canDraftSave ? [{ value: 'draft' as const, label: L.saveModes.draft }] : []),
      ...(canSubmit
        ? [
            { value: 'soft' as const, label: L.saveModes.soft },
            { value: 'submit' as const, label: L.saveModes.submit },
          ]
        : []),
    ];
    const activeMode = modes.some((m) => m.value === mode) ? mode : (modes[0]?.value ?? 'draft');

    const handleSave = (correctionReason?: string) => {
      if (!isEntry || !instance) return;
      if (activeMode === 'submit') {
        const errors = formDef.fields.flatMap((field) => {
          const message = validateClinicalValue(field, currentValues[field.key]);
          return message ? [[field.key, message]] : [];
        });
        if (errors.length > 0) {
          setFieldErrors(Object.fromEntries(errors));
          notify.error(L.fixErrors);
          return;
        }
      }
      const cleaned = Object.fromEntries(Object.entries(currentValues).map(([k, v]) => [k, v.trim()]));
      const hasSubmission = !!instance.submittedValues || instance.progress === 'submitted';
      if (activeMode === 'submit' && !correctionReason && hasSubmission &&
        formDef.fields.some((field) => (reviewValues[field.key] ?? '') !== (cleaned[field.key] ?? ''))) {
        setCorrection({ scope, reason: '' });
        return;
      }
      if (!saveForm(participant.id, formKey, cleaned, activeMode === 'draft' ? 'draft' : activeMode === 'soft' ? 'softSubmitted' : 'submitted', correctionReason)) {
        notify.error(L.notSaved);
        return;
      }
      setCorrection(undefined);
      setEdits(null);
      setFieldErrors({});
      notify.success(
        activeMode === 'draft' ? L.savedDraft(formDef.label) : activeMode === 'soft' ? L.savedSoft(formDef.label) : L.savedSubmit(formDef.label),
      );
    };

    return {
      title: canEnterData ? L.entryTitle : L.viewTitle,
      note: databaseLocked ? 'The project database is locked. Participant data is read-only.' : canEnterData ? L.entryNote : L.readOnlyNote,
      // Site users see the form names and padlocks only (Site p.7); reviewers also see progress and open-query counts.
      showProgress: !canEnterData,
      backTo: paths.siteEcrfs(projectId, siteId),
      identifiers: [
        { label: L.identifiers.screeningNo, value: participant.screeningNo },
        { label: L.identifiers.participantNo, value: participant.participantNo ?? L.notEnrolled },
        { label: L.identifiers.initials, value: participant.initials },
        { label: L.identifiers.status, value: statusLabel(participant.statusId) },
      ],
      details: canEnterData && !databaseLocked ? details : undefined,
      forms,
      form: {
        label: formDef.label,
        progress: instance?.progress ?? 'notStarted',
        progressLabel: !instance || instance.progress === 'notStarted' ? L.notStarted : instance.progress === 'draft' ? L.draft : instance.progress === 'softSubmitted' ? 'Soft submitted' : L.submitted,
        isLocked,
        lockedText: instance?.lock ? L.lockedBy(userNameById(users, instance.lock.byUserId), whenText(instance.lock.at)) : '',
        lockedNote: canEnterData ? L.lockedEntry : L.lockedNote,
        canLock: canLock && !databaseLocked && !!instance && (isLocked || (instance.progress === 'submitted' && !own.some((q) => q.formKey === formKey && q.status !== 'resolved'))),
        toggleLock: handleToggleLock,
      },
      entry: {
        isEnabled: isEntry && modes.length > 0,
        modes,
        mode: activeMode,
        setMode,
        save: () => handleSave(),
        correction: {
          isOpen: correction?.scope === scope,
          reason: correction?.reason ?? '',
          setReason: (reason: string) => setCorrection({ scope, reason }),
          cancel: () => setCorrection(undefined),
          confirm: () => { if (correction?.scope === scope && correction.reason.trim()) handleSave(correction.reason); },
        },
      },
      fields,
      panel: {
        isOpen: !!selectedDef,
        fieldLabel: selectedDef?.label ?? '',
        formLabel: formDef.label,
        queries: selectedQueries.map(describe),
        canRaise: !raiseBlockedReason,
        raiseBlockedReason,
        canResolve: canResolve && !databaseLocked && !isLocked && openQuery?.status === 'responded',
        canRespond: canRespond && isAnswerable && !isLocked && !databaseLocked,
        respondBlockedReason: canRespond && isAnswerable && isLocked ? Q.lockedRespond : '',
        draft,
        draftError,
        setDraft: (value: string) => {
          setDraft(value);
          setDraftError('');
        },
        responseDraft,
        responseError,
        setResponseDraft: (value: string) => {
          setResponseDraft(value);
          setResponseError('');
        },
        raise: handleRaise,
        resolve: handleResolve,
        respond: handleRespond,
        close: () => select(formKey),
      },
    };
  }, [
    participant, queries, users, formKey, fieldKey, scope, edits, mode, fieldErrors, selectedQueries, openQuery, correction,
    draft, draftError, responseDraft, responseError, details,
    canLock, canRaise, canResolve, canEnterData, canDraftSave, canSubmit, canRespond,
    projectId, siteId, statusLabel, definitions, databaseLocked, lockForm, unlockForm, saveForm, raiseQuery, resolveQuery, respondQuery, setSearchParams,
  ]);
}

export type ParticipantViewModel = NonNullable<ReturnType<typeof useParticipantView>>;
