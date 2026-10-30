import { Navigate } from 'react-router-dom';
import { useHomePath } from '../hooks/useHomePath';

export function HomeRedirectPage() {
  const homePath = useHomePath();
  return <Navigate to={homePath} replace />;
}
