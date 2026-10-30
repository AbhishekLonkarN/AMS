import { NotFoundPage } from '@/features/shell';
import { AdminUserFormView } from '../components/AdminUserFormView';
import { useAdminUserForm, type FormMode } from '../hooks/useAdminUserForm';

interface AdminUserFormContainerProps {
  mode: FormMode;
  userId?: string;
  onDone: () => void;
}

/** Drawer content container: wires the form hook to the drawer form view. */
export function AdminUserFormContainer({ mode, userId, onDone }: AdminUserFormContainerProps) {
  const { isNotFound, ...model } = useAdminUserForm({ mode, userId, onDone });
  if (isNotFound) return <NotFoundPage />;
  return <AdminUserFormView {...model} />;
}
