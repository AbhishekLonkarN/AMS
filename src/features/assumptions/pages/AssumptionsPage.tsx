import { AssumptionsView } from '../components/AssumptionsView';
import { useAssumptions } from '../hooks/useAssumptions';

export function AssumptionsPage() {
  const model = useAssumptions();
  return <AssumptionsView {...model} />;
}
