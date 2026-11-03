import type { AccessRightsTemplate, AffiliationStatus, RecordStatus, User } from '@/types';
import { TIME_ZONE_OPTIONS } from '@/constants/time-zone.constants';
import { AFFILIATION_LABELS as L } from '../constants/affiliation.constants';
import { USER_FIELD_LABELS as F } from '../constants/user-common.constants';
import { DRAWER_LABELS as D } from '../constants/drawer.constants';
import type { DetailField } from '../user-common.types';
import type { DetailSection } from '../components/UserDetailDrawerView';
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
  /** Title of the assignment section ("Affiliation", "Site user"). */
  assignmentTitle: string;
  /** Extra rows at the end of the assignment section. */
  extraAssignmentFields?: DetailField[];
}

/** Overview sections of an affiliation / membership View drawer: user, assignment, record. */
export function affiliationDetailSections(input: AffiliationDetailInput): DetailSection[] {
  const { user, users, templates } = input;
  const timeZone = TIME_ZONE_OPTIONS.find((o) => o.value === input.timeZone)?.label ?? input.timeZone;
  return [
    {
      title: D.userDetails,
      items: [
        { label: F.prefix, value: user?.prefix },
        { label: F.name, value: user?.name },
        { label: F.email, value: user?.email },
        ...(input.hasOrganization ? [{ label: F.organization, value: user?.organization }] : []),
      ],
    },
    {
      title: input.assignmentTitle,
      items: [
        { label: F.designation, value: input.designation },
        { label: F.timeZone, value: timeZone },
        { label: F.template, value: templates.find((t) => t.id === input.templateId)?.name },
        ...(input.extraAssignmentFields ?? []),
      ],
    },
    {
      title: D.record,
      items: [
        { label: L.affiliatedOn, value: formatCreated(input.since) },
        { label: L.affiliatedBy, value: userNameById(users, input.sinceBy) },
        ...(input.endedAt ? [{ label: L.deaffiliatedOn, value: formatCreated(input.endedAt) }] : []),
      ],
    },
  ];
}
