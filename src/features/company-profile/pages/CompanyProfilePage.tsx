import { CompanyProfileView } from '../components/CompanyProfileView';
import { useCompanyProfile } from '../hooks/useCompanyProfile';

export function CompanyProfilePage() {
  const model = useCompanyProfile();
  return <CompanyProfileView {...model} />;
}
