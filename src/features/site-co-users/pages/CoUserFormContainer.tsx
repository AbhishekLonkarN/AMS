import { NotFoundPage } from '@/features/shell';
import { AffiliationFormView } from '@/features/user-common';
import { useCoUserForm, type FormMode } from '../hooks/useCoUserForm';

interface CoUserFormContainerProps {
  mode: FormMode;
  projectId: string;
  siteId: string;
  affiliationId?: string;
  onDone: () => void;
}

/** Drawer content container: wires the form hook to the shared affiliation drawer form. */
export function CoUserFormContainer(props: CoUserFormContainerProps) {
  const { isNotFound, ...model } = useCoUserForm(props);
  if (isNotFound) return <NotFoundPage />;
  return <AffiliationFormView {...model} />;
}
