import type { AccessRightsTemplate, AffiliationStatus, RecordStatus, User } from '@/types';
import { TIME_ZONE_OPTIONS } from '@/constants/time-zone.constants';
import { AFFILIATION_LABELS as L } from '../constants/affiliation.constants';
import { USER_FIELD_LABELS as F } from '../constants/user-common.constants';
import type { DetailField } from '../components/RecordDetailView';
import { formatCreated, userNameById } from './user-common.utils';

interface AffiliationDetailInput {
  user?: User;
  designation: string;
  timeZone: string;
  templateId: string;
  status: AffiliationStatus | RecordStatus;
  since: string;
  sinceBy?: string;
  endedAt?: string;
  hasOrganization: boolean;
  users: User[];
  templates: AccessRightsTemplate[];
}

/** Read-only fields for an affiliation / membership "View" page. */
export function affiliationDetailFields(input: AffiliationDetailInput): DetailField[] {
  const { user, users, templates } = input;
  const timeZone = TIME_ZONE_OPTIONS.find((o) => o.value === input.timeZone)?.label ?? input.timeZone;
  return [
    { label: F.prefix, value: user?.prefix },
    { label: F.name, value: user?.name },
    { label: F.email, value: user?.email },
    ...(input.hasOrganization ? [{ label: F.organization, value: user?.organization }] : []),
    { label: F.designation, value: input.designation },
    { label: F.timeZone, value: timeZone },
    { label: F.template, value: templates.find((t) => t.id === input.templateId)?.name },
    { label: L.affiliatedOn, value: formatCreated(input.since) },
    { label: L.affiliatedBy, value: userNameById(users, input.sinceBy) },
    ...(input.endedAt ? [{ label: L.deaffiliatedOn, value: formatCreated(input.endedAt) }] : []),
  ];
}
