import { z } from 'zod';
import { validateParticipantStatus } from '@/utils/participant.utils';
import { PARTICIPANT_VALIDATION as V } from '../constants/site-ecrfs.constants';

interface ParticipantChecks {
  /** "FR-006-S": the system pre-fix of every Screening No./ID of the site. */
  screeningPrefix: string;
  /** "FR-006-": the system pre-fix of every Participant No./ID of the site. */
  participantPrefix: string;
  isScreeningNoTaken: (value: string) => boolean;
  isParticipantNoTaken: (value: string) => boolean;
}

/** Identifiers must carry the site pre-fix and be unique within the project (Site p.8). */
export function buildParticipantSchema({
  screeningPrefix,
  participantPrefix,
  isScreeningNoTaken,
  isParticipantNoTaken,
}: ParticipantChecks) {
  return z.object({
    screeningNo: z
      .string()
      .trim()
      .min(1, V.required)
      .superRefine((value, ctx) => {
        if (!value.startsWith(screeningPrefix) || value.length === screeningPrefix.length) {
          ctx.addIssue({ code: 'custom', message: V.screeningFormat(screeningPrefix) });
        } else if (isScreeningNoTaken(value)) {
          ctx.addIssue({ code: 'custom', message: V.screeningTaken });
        }
      }),
    // Blank until the participant is enrolled (screen failures never get one).
    participantNo: z
      .string()
      .trim()
      .superRefine((value, ctx) => {
        if (!value) {return;}
        if (!value.startsWith(participantPrefix) || value.length === participantPrefix.length) {
          ctx.addIssue({ code: 'custom', message: V.participantFormat(participantPrefix) });
        } else if (isParticipantNoTaken(value)) {
          ctx.addIssue({ code: 'custom', message: V.participantTaken });
        }
      }),
    initials: z.string().trim().min(1, V.required).regex(/^[A-Za-z]{2,5}$/, V.initials),
    statusId: z.string().min(1, V.required),
  }).superRefine(({ statusId, participantNo }, ctx) => {
    const message = validateParticipantStatus(statusId, participantNo);
    if (message) {ctx.addIssue({ code: 'custom', path: ['participantNo'], message });}
  });
}

export type ParticipantFormValues = z.infer<ReturnType<typeof buildParticipantSchema>>;
