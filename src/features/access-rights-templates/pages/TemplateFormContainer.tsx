import { NotFoundPage } from '@/features/shell';
import { TemplateFormView } from '../components/TemplateFormView';
import { useTemplateForm, type FormMode } from '../hooks/useTemplateForm';

interface TemplateFormContainerProps {
  mode: FormMode;
  templateId?: string;
  onDone: () => void;
}

/** Drawer content container: wires the form hook to the drawer form view. */
export function TemplateFormContainer({ mode, templateId, onDone }: TemplateFormContainerProps) {
  const { isNotFound, ...model } = useTemplateForm({ mode, templateId, onDone });
  if (isNotFound) return <NotFoundPage />;
  return <TemplateFormView {...model} />;
}
