import { NotFoundPage } from '@/features/shell';
import { TemplateFormView } from '../components/TemplateFormView';
import { useTemplateForm, type FormMode } from '../hooks/useTemplateForm';

interface TemplateFormPageProps {
  mode: FormMode;
}

export function TemplateFormPage({ mode }: TemplateFormPageProps) {
  const { isNotFound, ...model } = useTemplateForm(mode);
  if (isNotFound) return <NotFoundPage />;
  return <TemplateFormView {...model} />;
}
