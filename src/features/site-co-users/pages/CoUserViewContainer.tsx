import { ConfirmDialog } from '@/components/feedback';
import { NotFoundPage } from '@/features/shell';
import { UserDetailDrawerView } from '@/features/user-common';
import { useCoUserDetail } from '../hooks/useCoUserDetail';

interface CoUserViewContainerProps {
  projectId: string;
  siteId: string;
  affiliationId?: string;
}

/** Drawer content container for View mode (+ its Deaffiliate confirm). */
export function CoUserViewContainer({ projectId, siteId, affiliationId }: CoUserViewContainerProps) {
  const model = useCoUserDetail(projectId, siteId, affiliationId);
  if (model.isNotFound) return <NotFoundPage />;
  const { confirm, isNotFound, ...view } = model;
  return (
    <>
      <UserDetailDrawerView {...view} />
      <ConfirmDialog {...confirm} />
    </>
  );
}
