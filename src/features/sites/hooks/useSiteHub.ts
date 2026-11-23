import { countSiteEnrolment } from '@/utils/participant.utils';
import { useParams } from 'react-router-dom';
import { useParticipantsStore, useSitesStore } from '@/store';
import { usePermission } from '@/rbac';
import { paths } from '@/app/router/route-paths.constants';
import { useHubTiles, type HubFact } from '@/features/shell';
import { useMasterLabel } from '@/features/masters';
import { SITE_FIELDS as F, SITE_LABELS as L } from '../constants/sites.constants';

/** Site hub: site/PI summary + permission-gated module tiles. */
export function useSiteHub() {
  const { projectId, siteId } = useParams();
  const site = useSitesStore((s) => s.sites.find((x) => x.id === siteId && x.projectId === projectId));
  const participants = useParticipantsStore((state) => state.participants);
  const masterLabel = useMasterLabel();
  const tiles = useHubTiles('site');
  const canEdit = usePermission('investigatorSite.edit');

  if (!site) {return null;}

  const enrolled = countSiteEnrolment(participants, site.id);
  const facts: HubFact[] = [
    { label: F.investigatorName, value: site.investigatorName },
    { label: F.investigatorEmail, value: site.investigatorEmail },
    { label: F.siteCode, value: site.siteCode },
    { label: F.location, value: site.location },
    { label: F.address, value: site.address },
  ];

  return {
    id: site.id,
    projectId: site.projectId,
    title: `${site.siteCode} · ${site.siteName}`,
    description: `${site.investigatorName} · ${site.location}`,
    status: masterLabel(site.statusId),
    editTo: canEdit ? paths.siteEdit(site.projectId, site.id) : undefined,
    facts,
    progress: {
      label: L.recruitment,
      valueText: L.recruitmentValue(enrolled, site.expectedRecruitment),
      value: enrolled,
      max: site.expectedRecruitment,
    },
    tiles,
  };
}
