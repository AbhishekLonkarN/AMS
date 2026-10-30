import { NotFoundPage } from '@/features/shell';
import { RecordDetailView } from '@/features/user-common';
import { useSponsorUserDetail } from '../hooks/useSponsorUserDetail';

export function SponsorUserViewPage() {
  const model = useSponsorUserDetail();
  if (model.isNotFound) return <NotFoundPage />;
  return <RecordDetailView {...model} />;
}
