import { UserListView } from '@/features/user-common';
import { useSponsorUserList } from '../hooks/useSponsorUserList';

export function SponsorUserListPage() {
  const model = useSponsorUserList();
  return <UserListView {...model} />;
}
