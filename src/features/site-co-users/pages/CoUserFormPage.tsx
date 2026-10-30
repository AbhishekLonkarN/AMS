import { NotFoundPage } from '@/features/shell';
import { AffiliationFormView } from '@/features/user-common';
import { useCoUserForm, type FormMode } from '../hooks/useCoUserForm';

interface CoUserFormPageProps {
  mode: FormMode;
}

export function CoUserFormPage({ mode }: CoUserFormPageProps) {
  const { isNotFound, ...model } = useCoUserForm(mode);
  if (isNotFound) return <NotFoundPage />;
  return <AffiliationFormView {...model} />;
}
