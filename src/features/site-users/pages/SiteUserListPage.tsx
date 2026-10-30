import { UserListView } from '@/features/user-common';
import { useSiteUserList } from '../hooks/useSiteUserList';

export function SiteUserListPage() {
  const model = useSiteUserList();
  return <UserListView {...model} />;
}
