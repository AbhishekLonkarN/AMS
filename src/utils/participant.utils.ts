import type { Participant } from '@/types';

const SCREENING_STATUSES = ['ms-pt-screen-failed', 'ms-pt-screen-pass'];
const ENROLLED_STATUSES = [
  'ms-pt-enrolled', 'ms-pt-withdrawn-investigator', 'ms-pt-consent-withdrawn',
  'ms-pt-lost-fu', 'ms-pt-death', 'ms-pt-completed',
];

export function validateParticipantStatus(statusId: string, participantNo = '') {
  if (SCREENING_STATUSES.includes(statusId) && participantNo.trim()) {
    return 'Leave Participant No./ID blank until enrolment.';
  }
  if (ENROLLED_STATUSES.includes(statusId) && !participantNo.trim()) {
    return 'Enter a Participant No./ID for an enrolled participant.';
  }
  return undefined;
}

export function isEnrolled(participant: Participant) {
  return !!participant.participantNo && !SCREENING_STATUSES.includes(participant.statusId);
}

export function countSiteEnrolment(participants: Participant[], siteId: string) {
  return participants.filter((participant) => participant.siteId === siteId && isEnrolled(participant)).length;
}
