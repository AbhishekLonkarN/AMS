import { NotFoundPage } from '@/features/shell';
import { ProjectFormView } from '../components/ProjectFormView';
import { useProjectForm, type FormMode } from '../hooks/useProjectForm';

interface ProjectFormContainerProps {
  mode: FormMode;
  projectId?: string;
  onDone: (projectId: string) => void;
}

/** Drawer content container: wires the form hook to the drawer form view. */
export function ProjectFormContainer({ mode, projectId, onDone }: ProjectFormContainerProps) {
  const { isNotFound, ...model } = useProjectForm({ mode, projectId, onDone });
  if (isNotFound) return <NotFoundPage />;
  return <ProjectFormView {...model} />;
}
