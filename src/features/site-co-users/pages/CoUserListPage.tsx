import { UserListView } from '@/features/user-common';
import { useCoUserList } from '../hooks/useCoUserList';

export function CoUserListPage() {
  const model = useCoUserList();
  return <UserListView {...model} />;
}
