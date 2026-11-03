import { ConfirmDialog } from '@/components/feedback';
import { NotFoundPage } from '@/features/shell';
import { UserDetailDrawerView } from '@/features/user-common';
import { useSponsorUserDetail } from '../hooks/useSponsorUserDetail';

interface SponsorUserViewContainerProps {
  projectId: string;
  affiliationId?: string;
}

/** Drawer content container for View mode (+ its Deaffiliate confirm). */
export function SponsorUserViewContainer({ projectId, affiliationId }: SponsorUserViewContainerProps) {
  const model = useSponsorUserDetail(projectId, affiliationId);
  if (model.isNotFound) return <NotFoundPage />;
  const { confirm, isNotFound, ...view } = model;
  return (
    <>
      <UserDetailDrawerView {...view} />
      <ConfirmDialog {...confirm} />
    </>
  );
}
