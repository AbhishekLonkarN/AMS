import type { FormBuilderConfig } from '@/components/dynamic-form';
import type { Id, IsoDateTime } from './common.types';

// ---- eCRF data (participants) ---------------------------------------------

export type FormProgress = 'notStarted' | 'draft' | 'softSubmitted' | 'submitted';

export interface FormLock {
  byUserId: Id;
  at: IsoDateTime;
}

/** One form of one participant (a page of the eCRF). */
export interface FormInstance {
  formKey: string;
  progress: FormProgress;
  /** Captured values by field key (read-only for CO and Sponsor users). */
  values: Record<string, string>;
  lock?: FormLock;
  submittedValues?: Record<string, string>;
}

/** A participant at a site. The enrolment ID is assigned only at enrolment. */
export interface Participant {
  id: Id;
  projectId: Id;
  siteId: Id;
  screeningNo: string;
  participantNo?: string;
  initials: string;
  /** MasterItem id (participantStatus). */
  statusId: Id;
  screenedAt: IsoDateTime;
  enrolledAt?: IsoDateTime;
  forms: FormInstance[];
  ecrfDesign?: FormBuilderConfig;
}

// ---- Queries --------------------------------------------------------------

/** red / light red / blue / green, in that order (AMS p.40 legend). */
export type QueryStatus = 'notRead' | 'read' | 'responded' | 'resolved';

/** A question raised by a monitor against one data field of one form of one participant. */
export interface DataQuery {
  id: Id;
  projectId: Id;
  siteId: Id;
  participantId: Id;
  formKey: string;
  fieldKey: string;
  text: string;
  response?: string;
  status: QueryStatus;
  raisedBy: Id;
  raisedAt: IsoDateTime;
  respondedBy?: Id;
  respondedAt?: IsoDateTime;
  resolvedBy?: Id;
  resolvedAt?: IsoDateTime;
}

// ---- eTMF -------------------------------------------------------------------

export type EtmfScope = 'project' | 'site';

export interface EtmfFileVersion {
  id: Id;
  fileName: string;
  version?: string;
  uploadedAt: IsoDateTime;
  uploadedBy: Id;
}

export interface EtmfDocument {
  id: Id;
  scope: EtmfScope;
  projectId: Id;
  /** Set for site documents only. */
  siteId?: Id;
  /** Hierarchical reference such as "1.1)". */
  srNo: string;
  title: string;
  /** Calendar dates (YYYY-MM-DD): shown as entered, never time-zone converted. */
  documentDate?: string;
  version?: string;
  validityDate?: string;
  fileName: string;
  fileVersions?: EtmfFileVersion[];
  uploadedAt: IsoDateTime;
  uploadedBy: Id;
  /** Deleting archives the document; it stays on record. */
  isArchived: boolean;
}

// ---- Contacts ---------------------------------------------------------------

export interface ContactPerson {
  name: string;
  email: string;
  phone: string;
}

/** "Sponsor and CO/CRO Contacts for Support": one card per project. */
export interface SupportContacts {
  projectId: Id;
  sponsorManager: ContactPerson & { organization: string };
  croName: string;
  croManager: ContactPerson;
  croAssistantManager: ContactPerson;
}

/** "Site Contacts": one card per site. Sponsor and CO users see it read-only. */
export interface SiteContacts {
  siteId: Id;
  investigator: { email: string; phone: string };
  smoName: string;
  crc1: ContactPerson;
  crc2: ContactPerson;
}
