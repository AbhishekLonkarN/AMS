import { Hammer } from 'lucide-react';
import { StatusPageView } from '../components/StatusPageView';
import { PLACEHOLDER_LABELS as L } from '../constants/shell.constants';

interface PlaceholderPageProps {
  title: string;
}

/** "Coming in Phase 2" page for modules whose content is not built yet (route + guard exist). */
export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return <StatusPageView icon={Hammer} eyebrow={L.badge} title={title} body={`${L.title}. ${L.body}`} />;
}
