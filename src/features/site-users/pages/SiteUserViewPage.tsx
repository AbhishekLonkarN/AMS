import { NotFoundPage } from '@/features/shell';
import { RecordDetailView } from '@/features/user-common';
import { useSiteUserDetail } from '../hooks/useSiteUserDetail';

export function SiteUserViewPage() {
  const model = useSiteUserDetail();
  if (model.isNotFound) return <NotFoundPage />;
  return <RecordDetailView {...model} />;
}
