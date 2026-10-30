import { NotFoundPage } from '@/features/shell';
import { RecordDetailView } from '@/features/user-common';
import { useCoUserDetail } from '../hooks/useCoUserDetail';

export function CoUserViewPage() {
  const model = useCoUserDetail();
  if (model.isNotFound) return <NotFoundPage />;
  return <RecordDetailView {...model} />;
}
