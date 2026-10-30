import type { Id, IsoDateTime } from './common.types';

/** An investigator + hospital taking part in one project. */
export interface Site {
  id: Id;
  projectId: Id;
  /** "Site ID" in the PDFs, e.g. FR-006. Unique within the project. */
  siteCode: string;
  siteName: string;
  investigatorName: string;
  investigatorEmail: string;
  location: string;
  address: string;
  expectedRecruitment: number;
  /** Calculated from enrolments in later phases; seeded for now. */
  actualRecruitment: number;
  /** MasterItem id (siteStatus). */
  statusId: Id;
  createdAt: IsoDateTime;
  createdBy?: Id;
}
