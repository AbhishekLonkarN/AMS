import { NotFoundPage } from '@/features/shell';
import { AffiliationFormView } from '@/features/user-common';
import { useSponsorUserForm, type FormMode } from '../hooks/useSponsorUserForm';

interface SponsorUserFormContainerProps {
  mode: FormMode;
  projectId: string;
  affiliationId?: string;
  onDone: () => void;
}

/** Drawer content container: wires the form hook to the shared affiliation drawer form. */
export function SponsorUserFormContainer(props: SponsorUserFormContainerProps) {
  const { isNotFound, ...model } = useSponsorUserForm(props);
  if (isNotFound) return <NotFoundPage />;
  return <AffiliationFormView {...model} />;
}
