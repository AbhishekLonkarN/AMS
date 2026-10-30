import { NotFoundPage } from '@/features/shell';
import { AccountFormView } from '../components/AccountFormView';
import { useAccountForm, type FormMode } from '../hooks/useAccountForm';

interface AccountFormContainerProps {
  mode: FormMode;
  userId?: string;
  onDone: () => void;
}

/** Drawer content container: wires the form hook to the drawer form view. */
export function AccountFormContainer({ mode, userId, onDone }: AccountFormContainerProps) {
  const { isNotFound, ...model } = useAccountForm({ mode, userId, onDone });
  if (isNotFound) return <NotFoundPage />;
  return <AccountFormView {...model} />;
}
