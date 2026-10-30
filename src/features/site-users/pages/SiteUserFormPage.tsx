import { NotFoundPage } from '@/features/shell';
import { SiteUserFormView } from '../components/SiteUserFormView';
import { useSiteUserForm, type FormMode } from '../hooks/useSiteUserForm';

interface SiteUserFormPageProps {
  mode: FormMode;
}

export function SiteUserFormPage({ mode }: SiteUserFormPageProps) {
  const { isNotFound, ...model } = useSiteUserForm(mode);
  if (isNotFound) return <NotFoundPage />;
  return <SiteUserFormView {...model} />;
}
