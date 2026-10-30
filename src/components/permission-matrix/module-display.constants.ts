import {
  Building2,
  ClipboardList,
  Cloud,
  Contact,
  Database,
  FileArchive,
  FileStack,
  FolderKanban,
  FolderOpen,
  History,
  Hospital,
  KeyRound,
  Link2,
  MessageSquareWarning,
  Settings,
  ShieldCheck,
  Tags,
  UserCog,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { ModuleKey } from '@/types';

export type ModuleTone = 'blue' | 'teal' | 'violet' | 'orange' | 'sky' | 'pink' | 'green';

export interface ModuleDisplay {
  icon: LucideIcon;
  tone: ModuleTone;
  description: string;
}

/** Icon, soft colour and one-line description per module, for the compact permission table. */
export const MODULE_DISPLAY: Record<ModuleKey, ModuleDisplay> = {
  // Admin
  companyProfile: { icon: Building2, tone: 'blue', description: 'Software name, logo and owner company details' },
  adminUser: { icon: UserCog, tone: 'teal', description: 'Admin users and their access rights' },
  sponsorCoUser: { icon: Link2, tone: 'violet', description: 'Global sponsor and CO / CRO accounts' },
  projectDatabase: { icon: Database, tone: 'orange', description: 'Export and lock project databases' },
  cloudSettings: { icon: Cloud, tone: 'sky', description: 'Cloud environment and back-up settings' },
  auditTrail: { icon: History, tone: 'pink', description: 'View and export the audit log' },
  // Sponsor – masters & global
  masterProductGroup: { icon: Tags, tone: 'blue', description: 'Device / therapeutic categories' },
  masterProjectStatus: { icon: Tags, tone: 'blue', description: 'Study lifecycle stages' },
  masterDefaultAccessRights: { icon: KeyRound, tone: 'violet', description: 'Access-rights templates' },
  masterSiteStatus: { icon: Tags, tone: 'blue', description: 'Site lifecycle stages' },
  masterParticipantStatus: { icon: Tags, tone: 'blue', description: 'Patient disposition values' },
  ecrfTemplate: { icon: FileStack, tone: 'teal', description: 'Reusable eCRF designs' },
  project: { icon: FolderKanban, tone: 'sky', description: 'Create and edit projects' },
  // Project & site
  projectEcrf: { icon: ClipboardList, tone: 'teal', description: 'eCRF of the project' },
  sponsorUserManagement: { icon: Users, tone: 'violet', description: 'Sponsor users affiliated to the project' },
  investigatorSite: { icon: Hospital, tone: 'sky', description: 'Investigators and sites of the project' },
  coUserManagement: { icon: ShieldCheck, tone: 'violet', description: 'CO / CRO users affiliated to sites' },
  siteUserManagement: { icon: UserPlus, tone: 'violet', description: 'Investigators, sub-investigators and CRCs' },
  siteEcrfs: { icon: ClipboardList, tone: 'green', description: 'Participant data entry at the site' },
  siteEcrfQuery: { icon: MessageSquareWarning, tone: 'orange', description: 'Queries raised on site eCRFs' },
  siteQueriesAll: { icon: MessageSquareWarning, tone: 'orange', description: 'Export all queries of a site' },
  etmfProject: { icon: FolderOpen, tone: 'green', description: 'Study-level regulatory documents' },
  etmfSite: { icon: FolderOpen, tone: 'green', description: 'Site-level regulatory documents' },
  projectQueriesAll: { icon: MessageSquareWarning, tone: 'orange', description: 'Export all queries of the project' },
  selectiveParticipantData: { icon: FileArchive, tone: 'orange', description: 'Export data of chosen participants' },
  supportContacts: { icon: Contact, tone: 'pink', description: 'Helpdesk contacts shown to sites' },
  siteContacts: { icon: Contact, tone: 'pink', description: 'PI, SMO and CRC contacts' },
  settings: { icon: Settings, tone: 'sky', description: 'Project-level settings' },
};
