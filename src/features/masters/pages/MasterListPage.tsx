import { useParams } from 'react-router-dom';
import type { MasterKey } from '@/types';
import { MasterListView } from '../components/MasterListView';
import { useMasterList } from '../hooks/useMasterList';

/** `/masters/:masterKey` — the key is validated by RequireMasterKey. */
export function MasterListPage() {
  const { masterKey } = useParams();
  const model = useMasterList(masterKey as MasterKey);
  return <MasterListView {...model} />;
}
