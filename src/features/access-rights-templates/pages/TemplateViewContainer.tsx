import { ConfirmDialog } from '@/components/feedback';
import { NotFoundPage } from '@/features/shell';
import { UserDetailDrawerView } from '@/features/user-common';
import { useTemplateDetail } from '../hooks/useTemplateDetail';

/** Drawer content container for View mode (+ its Deactivate / Re-activate confirm). */
export function TemplateViewContainer({ templateId }: { templateId?: string }) {
  const model = useTemplateDetail(templateId);
  if (model.isLoading) {
    return null;
  }
  if (model.isNotFound) {
    return <NotFoundPage />;
  }
  const { confirm, isNotFound: _isNotFound, isLoading: _isLoading, ...view } = model;
  return (
    <>
      <UserDetailDrawerView {...view} />
      <ConfirmDialog {...confirm} />
    </>
  );
}
