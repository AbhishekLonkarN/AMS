import { ConfirmDialog } from '@/components/feedback';
import { NotFoundPage } from '@/features/shell';
import { UserDetailDrawerView } from '@/features/user-common';
import { useAccountDetail } from '../hooks/useAccountDetail';

/** Drawer content container for View mode (+ its Deactivate / Re-activate confirm). */
export function AccountViewContainer({ userId }: { userId?: string }) {
  const model = useAccountDetail(userId);
  if (model.isNotFound) return <NotFoundPage />;
  const { confirm, isNotFound, ...view } = model;
  return (
    <>
      <UserDetailDrawerView {...view} />
      <ConfirmDialog {...confirm} />
    </>
  );
}
