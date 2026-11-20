import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Id, Participant } from '@/types';
import { notify, useParticipantsStore, useSitesStore } from '@/store';
import { useMasterOptions } from '@/features/masters';
import { isSameText } from '@/utils/string.utils';
import { PARTICIPANT_LABELS as L } from '../constants/site-ecrfs.constants';
import { buildParticipantSchema, type ParticipantFormValues } from '../schemas/participant.schema';

interface Options {
  siteId: Id;
  /** Set to edit that participant; omitted to add a new one. */
  participant?: Participant;
  /** Called after a new participant is added, to open its eCRF. */
  onAdded?: (participant: Participant) => void;
}

const nextSerial = (participants: Participant[], prefix: string) => {
  const used = participants
    .map((p) => (p.screeningNo.startsWith(prefix) ? Number(p.screeningNo.slice(prefix.length)) : 0))
    .filter(Number.isFinite);
  return String(Math.max(0, ...used) + 1).padStart(4, '0');
};

/** Add New Participant / edit a participant's identifiers: one dialog, validated against the project. */
export function useParticipantDetailsForm({ siteId, participant, onAdded }: Options) {
  const site = useSitesStore((s) => s.sites.find((x) => x.id === siteId));
  const participants = useParticipantsStore((s) => s.participants);
  const addParticipant = useParticipantsStore((s) => s.addParticipant);
  const updateParticipant = useParticipantsStore((s) => s.updateParticipant);
  const statusOptions = useMasterOptions('participantStatus', participant?.statusId);
  const [isOpen, setIsOpen] = useState(false);

  const isEdit = !!participant;
  const siteCode = site?.siteCode ?? '';
  const screeningPrefix = `${siteCode}-S`;
  const participantPrefix = `${siteCode}-`;

  // Identifiers are unique within the whole project. Read when validating, so one schema serves every open.
  const projectRef = useRef<Participant[]>([]);
  projectRef.current = participants.filter((p) => p.projectId === site?.projectId);
  const selfIdRef = useRef<Id | undefined>(undefined);
  selfIdRef.current = participant?.id;

  const schema = useMemo(
    () =>
      buildParticipantSchema({
        screeningPrefix,
        participantPrefix,
        isScreeningNoTaken: (v) => projectRef.current.some((p) => p.id !== selfIdRef.current && isSameText(p.screeningNo, v)),
        isParticipantNoTaken: (v) => projectRef.current.some((p) => p.id !== selfIdRef.current && isSameText(p.participantNo, v)),
      }),
    [screeningPrefix, participantPrefix],
  );

  const form = useForm<ParticipantFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { screeningNo: '', participantNo: '', initials: '', statusId: '' },
  });

  const open = () => {
    form.reset(
      participant
        ? {
            screeningNo: participant.screeningNo,
            participantNo: participant.participantNo ?? '',
            initials: participant.initials,
            statusId: participant.statusId,
          }
        : {
            screeningNo: `${screeningPrefix}${nextSerial(projectRef.current.filter((p) => p.siteId === siteId), screeningPrefix)}`,
            participantNo: '',
            initials: '',
            statusId: '',
          },
    );
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  const handleSubmit = form.handleSubmit((values) => {
    const details = { participantNo: values.participantNo, initials: values.initials, statusId: values.statusId };
    if (participant) {
      if (!updateParticipant(participant.id, details)) { notify.error('This participant is read-only.'); return; }
      notify.success(L.saved(participant.screeningNo));
    } else {
      const added = addParticipant(siteId, { screeningNo: values.screeningNo, ...details });
      if (!added) { notify.error('Registration needs a published eCRF and an open project database.'); return; }
      notify.success(L.added(added.screeningNo));
      onAdded?.(added);
    }
    close();
  });

  return { isOpen, isEdit, open, close, form, handleSubmit, statusOptions, screeningPrefix, participantPrefix };
}

export type ParticipantDetailsModel = ReturnType<typeof useParticipantDetailsForm>;
