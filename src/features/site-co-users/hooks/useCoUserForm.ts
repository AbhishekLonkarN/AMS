import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { notify, useAffiliationsStore, useSitesStore } from '@/store';
import { paths } from '@/app/router/route-paths.constants';
import { DESIGNATION_OPTIONS } from '@/constants/user.constants';
import { AFFILIATION_LABELS as A, useAffiliationForm } from '@/features/user-common';
import { CO_USER_LABELS as L } from '../constants/co-users.constants';

export type FormMode = 'create' | 'edit';

export function useCoUserForm(mode: FormMode) {
  const navigate = useNavigate();
  const { projectId = '', siteId = '', affiliationId } = useParams();
  const site = useSitesStore((s) => s.sites.find((x) => x.id === siteId));
  const affiliations = useAffiliationsStore((s) => s.coAffiliations);
  const affiliateCoUser = useAffiliationsStore((s) => s.affiliateCoUser);
  const updateCoAffiliation = useAffiliationsStore((s) => s.updateCoAffiliation);

  const existing =
    mode === 'edit'
      ? affiliations.find((a) => a.id === affiliationId && a.siteId === siteId && a.status === 'active')
      : undefined;
  const affiliatedUserIds = useMemo(
    () => new Set(affiliations.filter((a) => a.siteId === siteId && a.status === 'active').map((a) => a.userId)),
    [affiliations, siteId],
  );
  const listPath = paths.siteCoUsers(projectId, siteId);

  const model = useAffiliationForm({
    accountType: 'co',
    matrixUserType: 'co',
    existing,
    affiliatedUserIds,
    designations: DESIGNATION_OPTIONS.co,
    onSubmit: ({ userId, ...assignment }, { name }) => {
      if (existing) {
        updateCoAffiliation(existing.id, assignment);
        notify.success(A.saved(name));
      } else {
        affiliateCoUser({ userId, projectId, siteId, ...assignment });
        notify.success(A.affiliated(name));
      }
      navigate(listPath);
    },
  });

  return {
    isNotFound: mode === 'edit' && !existing,
    title: mode === 'create' ? L.affiliateTitle : L.editTitle,
    description: site ? `${site.siteCode} · ${site.siteName}` : undefined,
    backTo: listPath,
    submitLabel: mode === 'create' ? A.submitCreate : A.submitEdit,
    matrixTitle: L.matrixTitle,
    model,
  };
}
