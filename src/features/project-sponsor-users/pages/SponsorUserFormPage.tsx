import { NotFoundPage } from '@/features/shell';
import { AffiliationFormView } from '@/features/user-common';
import { useSponsorUserForm, type FormMode } from '../hooks/useSponsorUserForm';

interface SponsorUserFormPageProps {
  mode: FormMode;
}

export function SponsorUserFormPage({ mode }: SponsorUserFormPageProps) {
  const { isNotFound, ...model } = useSponsorUserForm(mode);
  if (isNotFound) return <NotFoundPage />;
  return <AffiliationFormView {...model} />;
}
