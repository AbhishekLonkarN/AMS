import { SearchX } from 'lucide-react';
import { ROUTES } from '@/app/router/route-paths.constants';
import { StatusPageView } from '../components/StatusPageView';
import { ERROR_PAGE_LABELS } from '../constants/shell.constants';

export function NotFoundPage() {
  return (
    <StatusPageView
      icon={SearchX}
      eyebrow={ERROR_PAGE_LABELS.notFoundCode}
      title={ERROR_PAGE_LABELS.notFoundTitle}
      body={ERROR_PAGE_LABELS.notFoundBody}
      actionLabel={ERROR_PAGE_LABELS.goHome}
      actionTo={ROUTES.root}
    />
  );
}
