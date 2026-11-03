import { NotFoundPage } from '@/features/shell';
import { SiteFormView } from '../components/SiteFormView';
import { useSiteForm, type FormMode } from '../hooks/useSiteForm';

interface SiteFormContainerProps {
  mode: FormMode;
  projectId: string;
  siteId?: string;
  onDone: () => void;
}

/** Drawer content container: wires the form hook to the drawer form view. */
export function SiteFormContainer(props: SiteFormContainerProps) {
  const { isNotFound, ...model } = useSiteForm(props);
  if (isNotFound) return <NotFoundPage />;
  return <SiteFormView {...model} />;
}
