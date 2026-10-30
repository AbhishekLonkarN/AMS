import { NotFoundPage } from '@/features/shell';
import { SiteFormView } from '../components/SiteFormView';
import { useSiteForm, type FormMode } from '../hooks/useSiteForm';

interface SiteFormPageProps {
  mode: FormMode;
}

export function SiteFormPage({ mode }: SiteFormPageProps) {
  const { isNotFound, ...model } = useSiteForm(mode);
  if (isNotFound) return <NotFoundPage />;
  return <SiteFormView {...model} />;
}
