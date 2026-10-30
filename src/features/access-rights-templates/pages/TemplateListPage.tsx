import { UserListView } from '@/features/user-common';
import { useTemplateList } from '../hooks/useTemplateList';

export function TemplateListPage() {
  const model = useTemplateList();
  return <UserListView {...model} />;
}
