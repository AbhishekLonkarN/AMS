import type { MasterItem, MasterKey, RecordStatus } from '@/types';

const UPDATED_AT = '2026-09-01T09:00:00.000Z';

const item = (
  masterKey: MasterKey,
  id: string,
  label: string,
  description: string,
  status: RecordStatus = 'active',
): MasterItem => ({ id, masterKey, label, description, status, createdBy: 'usr-jpatel', updatedAt: UPDATED_AT });

export const MASTERS_SEED: MasterItem[] = [
  // ---- Product Group ----
  item('productGroup', 'ms-pg-ic', 'IC', 'Interventional Cardiology'),
  item('productGroup', 'ms-pg-cs', 'CS', 'Cardiovascular Surgery'),
  item('productGroup', 'ms-pg-wc-endo', 'WC-Endo', 'Wound Closure and Endo Surgery', 'inactive'),

  // ---- Project Status ----
  item('projectStatus', 'ms-ps-under-planning', 'Under Planning', 'Confirmed to initiate, but CIP under final touch.'),
  item('projectStatus', 'ms-ps-cdsco-approved', 'CDSCO Approved', 'CIP is approved by CDSCO.'),
  item('projectStatus', 'ms-ps-site-selection', 'Site Selection', 'Clinical sites and investigators selection ongoing.'),
  item('projectStatus', 'ms-ps-ongoing', 'Ongoing', 'Project is allowed for enrolment.'),
  item('projectStatus', 'ms-ps-enrolment-completed', 'Enrolment Completed', 'Enrolment target completed, follow-up ongoing.'),
  item(
    'projectStatus',
    'ms-ps-clinical-completed',
    'Clinical Phase Completed',
    'All follow-up completed for all enrolled participants.',
  ),
  item(
    'projectStatus',
    'ms-ps-db-locked',
    'Database Locked',
    'All FU completed, all data queries resolved, all site close-out completed and database is locked for data analysis.',
  ),
  item('projectStatus', 'ms-ps-archived', 'Archived', 'CER signed.'),

  // ---- Site Status ----
  item(
    'siteStatus',
    'ms-ss-feasibility',
    'Feasibility Done',
    'Feasibility study has been carried out, but site selection decision not yet taken.',
  ),
  item('siteStatus', 'ms-ss-selected', 'Selected', 'Site has been selected for participation in this study.'),
  item(
    'siteStatus',
    'ms-ss-backup',
    'Back-up',
    'Site has been selected but not to be initiated as of now, and in case required, will be initiated in future for this study.',
  ),
  item('siteStatus', 'ms-ss-initiated', 'Initiated', 'Site has been initiated for recruitment of participants in the study.'),
  item('siteStatus', 'ms-ss-closed', 'Closed', 'Site has been closed for this study.'),
  item(
    'siteStatus',
    'ms-ss-paused',
    'Paused',
    'Recruitment of participant at site has paused for time being for this study.',
  ),
  item(
    'siteStatus',
    'ms-ss-terminated',
    'Terminated',
    'Site has been terminated from recruiting more participants in this study.',
  ),
  item(
    'siteStatus',
    'ms-ss-terminated-closed',
    'Terminated and Closed',
    'Site has been terminated from recruiting more participants in this study and closed for this study.',
  ),
  item('siteStatus', 'ms-ss-recruiting', 'Recruiting', 'Site is currently recruiting participants in this study.'),
  item(
    'siteStatus',
    'ms-ss-target-achieved',
    'Recruitment Target Achieved',
    'Site has completed given recruitment target for this study.',
  ),

  // ---- Participant Status ----
  item(
    'participantStatus',
    'ms-pt-screen-failed',
    'Screen Failed',
    'Participant has undergone screening but was not found meeting inclusion/exclusion criteria.',
  ),
  item(
    'participantStatus',
    'ms-pt-screen-pass',
    'Screen Pass',
    'Participant has undergone screening and was found meeting inclusion/exclusion criteria.',
  ),
  item(
    'participantStatus',
    'ms-pt-enrolled',
    'Enrolled',
    'Participant has undergone screening, met inclusion/exclusion criteria and has been allotted to a treatment group.',
  ),
  item(
    'participantStatus',
    'ms-pt-withdrawn-investigator',
    'Withdrawn by Investigator',
    'After enrolment, participant has been withdrawn by the Investigator from the study.',
  ),
  item('participantStatus', 'ms-pt-consent-withdrawn', 'Consent Withdrawn', 'After enrolment, participant has withdrawn the consent.'),
  item('participantStatus', 'ms-pt-lost-fu', 'Lost to follow-up', 'After enrolment, participant has been lost to follow-up.'),
  item('participantStatus', 'ms-pt-completed', 'Completed', 'After enrolment, participant has completed the study.'),
];
