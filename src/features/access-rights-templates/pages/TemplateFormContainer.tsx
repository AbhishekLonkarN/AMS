import { NotFoundPage } from '@/features/shell';
import { useAccessRightsSetsStore } from '@/store';
import { TemplateFormView } from '../components/TemplateFormView';
import { useTemplateForm, type FormMode } from '../hooks/useTemplateForm';

interface TemplateFormContainerProps {
  mode: FormMode;
  templateId?: string;
  onDone: () => void;
}

/** Drawer content container. Edit waits for the sets to load: the form reads its values once. */
export function TemplateFormContainer(props: TemplateFormContainerProps) {
  const isLoaded = useAccessRightsSetsStore((s) => s.loadState === 'loaded');
  const hasTemplate = useAccessRightsSetsStore((s) => s.sets.some((t) => t.id === props.templateId));
  if (props.mode === 'edit' && !hasTemplate) {
    return isLoaded ? <NotFoundPage /> : null;
  }
  return <TemplateForm {...props} />;
}

function TemplateForm({ mode, templateId, onDone }: TemplateFormContainerProps) {
  const { isNotFound, ...model } = useTemplateForm({ mode, templateId, onDone });
  if (isNotFound) {
    return <NotFoundPage />;
  }
  return <TemplateFormView {...model} />;
}
