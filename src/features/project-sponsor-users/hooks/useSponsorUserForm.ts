import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { notify, useAffiliationsStore, useProjectsStore } from '@/store';
import { paths } from '@/app/router/route-paths.constants';
import { DESIGNATION_OPTIONS } from '@/constants/user.constants';
import { AFFILIATION_LABELS as A, useAffiliationForm } from '@/features/user-common';
import { SPONSOR_USER_LABELS as L } from '../constants/sponsor-users.constants';

export type FormMode = 'create' | 'edit';

export function useSponsorUserForm(mode: FormMode) {
  const navigate = useNavigate();
  const { projectId = '', affiliationId } = useParams();
  const project = useProjectsStore((s) => s.projects.find((p) => p.id === projectId));
  const affiliations = useAffiliationsStore((s) => s.sponsorAffiliations);
  const affiliateSponsorUser = useAffiliationsStore((s) => s.affiliateSponsorUser);
  const updateSponsorAffiliation = useAffiliationsStore((s) => s.updateSponsorAffiliation);

  const existing =
    mode === 'edit'
      ? affiliations.find((a) => a.id === affiliationId && a.projectId === projectId && a.status === 'active')
      : undefined;
  const affiliatedUserIds = useMemo(
    () => new Set(affiliations.filter((a) => a.projectId === projectId && a.status === 'active').map((a) => a.userId)),
    [affiliations, projectId],
  );
  const listPath = paths.projectSponsorUsers(projectId);

  const model = useAffiliationForm({
    accountType: 'sponsor',
    matrixUserType: 'sponsor',
    scopeType: 'project',
    existing,
    affiliatedUserIds,
    designations: DESIGNATION_OPTIONS.sponsor,
    onSubmit: ({ userId, ...assignment }, { name }) => {
      if (existing) {
        updateSponsorAffiliation(existing.id, assignment);
        notify.success(A.saved(name));
      } else {
        affiliateSponsorUser({ userId, projectId, ...assignment });
        notify.success(A.affiliated(name));
      }
      navigate(listPath);
    },
  });

  return {
    isNotFound: mode === 'edit' && !existing,
    title: mode === 'create' ? L.affiliateTitle : L.editTitle,
    description: project?.name,
    backTo: listPath,
    submitLabel: mode === 'create' ? A.submitCreate : A.submitEdit,
    matrixTitle: L.matrixTitle,
    model,
  };
}
