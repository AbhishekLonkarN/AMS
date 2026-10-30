import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { ROUTES } from './route-paths.constants';

const LABELS = {
  title: 'Something went wrong',
  reload: 'Back to home',
} as const;

/** Last-resort error boundary for the router (wireframe: shows the raw message). */
export function RouteErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : String(error);

  return (
    <div className="page-container">
      <div className="section-card flex flex-col gap-3">
        <h1>{LABELS.title}</h1>
        <pre className="overflow-auto rounded-control bg-base-200 p-4 text-caption">{message}</pre>
        <a href={ROUTES.root} className="btn btn-primary self-start">
          {LABELS.reload}
        </a>
      </div>
    </div>
  );
}
