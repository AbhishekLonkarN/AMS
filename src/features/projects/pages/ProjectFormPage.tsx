import { NotFoundPage } from '@/features/shell';
import { ProjectFormView } from '../components/ProjectFormView';
import { useProjectForm, type FormMode } from '../hooks/useProjectForm';

interface ProjectFormPageProps {
  mode: FormMode;
}

export function ProjectFormPage({ mode }: ProjectFormPageProps) {
  const { isNotFound, ...model } = useProjectForm(mode);
  if (isNotFound) return <NotFoundPage />;
  return <ProjectFormView {...model} />;
}
