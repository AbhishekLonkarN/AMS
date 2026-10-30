import { ConfirmDialog } from '@/components/feedback';
import { NotFoundPage } from '@/features/shell';
import { UserDetailDrawerView } from '@/features/user-common';
import { useAdminUserDetail } from '../hooks/useAdminUserDetail';

/** Drawer content container for View mode (+ its Deactivate / Re-activate confirm). */
export function AdminUserViewContainer({ userId }: { userId?: string }) {
  const model = useAdminUserDetail(userId);
  if (model.isNotFound) return <NotFoundPage />;
  const { confirm, isNotFound, ...view } = model;
  return (
    <>
      <UserDetailDrawerView {...view} matrixStyle="table" />
      <ConfirmDialog {...confirm} />
    </>
  );
}
