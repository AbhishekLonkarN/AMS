import { UserListView } from '@/features/user-common';
import { useProjectList } from '../hooks/useProjectList';

export function ProjectListPage() {
  const model = useProjectList();
  return <UserListView {...model} />;
}
