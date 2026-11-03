import { NotFoundPage } from '@/features/shell';
import { SiteUserFormView } from '../components/SiteUserFormView';
import { useSiteUserForm, type FormMode } from '../hooks/useSiteUserForm';

interface SiteUserFormContainerProps {
  mode: FormMode;
  projectId: string;
  siteId: string;
  membershipId?: string;
  onDone: () => void;
}

/** Drawer content container: wires the form hook to the drawer form view. */
export function SiteUserFormContainer(props: SiteUserFormContainerProps) {
  const { isNotFound, ...model } = useSiteUserForm(props);
  if (isNotFound) return <NotFoundPage />;
  return <SiteUserFormView {...model} />;
}
