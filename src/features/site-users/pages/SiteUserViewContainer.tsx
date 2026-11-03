import { ConfirmDialog } from '@/components/feedback';
import { NotFoundPage } from '@/features/shell';
import { UserDetailDrawerView } from '@/features/user-common';
import { useSiteUserDetail } from '../hooks/useSiteUserDetail';

interface SiteUserViewContainerProps {
  projectId: string;
  siteId: string;
  membershipId?: string;
}

/** Drawer content container for View mode (+ its Deactivate / Re-activate confirm). */
export function SiteUserViewContainer({ projectId, siteId, membershipId }: SiteUserViewContainerProps) {
  const model = useSiteUserDetail(projectId, siteId, membershipId);
  if (model.isNotFound) return <NotFoundPage />;
  const { confirm, isNotFound, ...view } = model;
  return (
    <>
      <UserDetailDrawerView {...view} />
      <ConfirmDialog {...confirm} />
    </>
  );
}
