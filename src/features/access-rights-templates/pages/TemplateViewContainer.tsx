import { ConfirmDialog } from '@/components/feedback';
import { NotFoundPage } from '@/features/shell';
import { UserDetailDrawerView } from '@/features/user-common';
import { useTemplateDetail } from '../hooks/useTemplateDetail';

/** Drawer content container for View mode (+ its Deactivate / Re-activate confirm). */
export function TemplateViewContainer({ templateId }: { templateId?: string }) {
  const model = useTemplateDetail(templateId);
  if (model.isNotFound) return <NotFoundPage />;
  const { confirm, isNotFound, ...view } = model;
  return (
    <>
      <UserDetailDrawerView {...view} />
      <ConfirmDialog {...confirm} />
    </>
  );
}
