import { AuditTrailView } from '../components/AuditTrailView';
import { useAuditTrail } from '../hooks/useAuditTrail';

export function AuditTrailPage() {
  const model = useAuditTrail();
  return <AuditTrailView {...model} />;
}
