import { ShieldX } from 'lucide-react';
import { ROUTES } from '@/app/router/route-paths.constants';
import { StatusPageView } from '../components/StatusPageView';
import { ERROR_PAGE_LABELS } from '../constants/shell.constants';

export function ForbiddenPage() {
  return (
    <StatusPageView
      icon={ShieldX}
      eyebrow={ERROR_PAGE_LABELS.forbiddenCode}
      title={ERROR_PAGE_LABELS.forbiddenTitle}
      body={ERROR_PAGE_LABELS.forbiddenBody}
      actionLabel={ERROR_PAGE_LABELS.goHome}
      actionTo={ROUTES.root}
    />
  );
}
