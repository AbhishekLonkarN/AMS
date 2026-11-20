import { NotFoundPage } from '@/features/shell';
import { ParticipantView } from '../components/ParticipantView';
import { useParticipantView } from '../hooks/useParticipantView';

export function ParticipantViewPage() {
  const model = useParticipantView();
  if (!model) {return <NotFoundPage />;}
  return <ParticipantView {...model} />;
}
