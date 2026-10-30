import { NotFoundPage } from '@/features/shell';
import { RecordDetailView } from '@/features/user-common';
import { useTemplateDetail } from '../hooks/useTemplateDetail';

export function TemplateViewPage() {
  const model = useTemplateDetail();
  if (model.isNotFound) return <NotFoundPage />;
  return <RecordDetailView {...model} />;
}
