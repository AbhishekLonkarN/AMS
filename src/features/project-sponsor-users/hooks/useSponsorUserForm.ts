import { useMemo } from 'react';
import { notify, useAffiliationsStore, useProjectsStore } from '@/store';
import { DESIGNATION_OPTIONS } from '@/constants/user.constants';
import { AFFILIATION_LABELS as A, useAffiliationForm } from '@/features/user-common';
import { SPONSOR_USER_LABELS as L } from '../constants/sponsor-users.constants';

export type FormMode = 'create' | 'edit';

interface SponsorUserFormOptions {
  mode: FormMode;
  projectId: string;
  affiliationId?: string;
  /** Called after a successful save (closes the drawer). */
  onDone: () => void;
}

export function useSponsorUserForm({ mode, projectId, affiliationId, onDone }: SponsorUserFormOptions) {
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
      onDone();
    },
  });

  return {
    isNotFound: mode === 'edit' && !existing,
    title: mode === 'create' ? L.affiliateTitle : L.editTitle,
    subtitle: project?.name,
    submitLabel: mode === 'create' ? A.submitCreate : A.submitEdit,
    matrixTitle: L.matrixTitle,
    model,
  };
}
