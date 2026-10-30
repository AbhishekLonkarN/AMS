import { UserListView } from '@/features/user-common';
import { useSiteList } from '../hooks/useSiteList';

export function SiteListPage() {
  const model = useSiteList();
  return <UserListView {...model} />;
}
