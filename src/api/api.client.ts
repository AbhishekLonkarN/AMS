/** Backend origin. Empty in development: Vite proxies `/api` to the local backend. */
const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '';

/** Non-2xx response or network failure. `code` is the backend error code, when there is one. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | null,
    message: string,
    /** Other keys of the backend error body, e.g. `field` or `invalid`. */
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

type HeadersProvider = () => Record<string, string>;

let extraHeaders: HeadersProvider = () => ({});

/**
 * Headers sent with every request. Until the backend has sessions it reads the caller from
 * `X-Dev-User-Email` (development and test only); the session store provides it.
 */
export function setRequestHeaders(provider: HeadersProvider) {
  extraHeaders = provider;
}

async function requestJson<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { ...extraHeaders() };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, null, 'Network error');
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const { code = null, message = response.statusText, ...details } = data?.error ?? {};
    throw new ApiError(response.status, code, message, details);
  }
  return data as T;
}

export const getJson = <T>(path: string) => requestJson<T>('GET', path);

export const postJson = <T>(path: string, body?: unknown) => requestJson<T>('POST', path, body);

export const putJson = <T>(path: string, body: unknown) => requestJson<T>('PUT', path, body);

export const patchJson = <T>(path: string, body: unknown) => requestJson<T>('PATCH', path, body);

/** For `204 No Content` responses. */
export const deleteJson = (path: string) => requestJson<null>('DELETE', path);

/** One page of a backend list. `page` is 1-based. */
export interface ApiPage<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

/** The backend's largest page size. */
const MAX_PAGE_SIZE = 100;

/** Every row of a paged list. `path` may already carry a query string. */
export async function getAllPages<T>(path: string): Promise<T[]> {
  const separator = path.includes('?') ? '&' : '?';
  const rows: T[] = [];
  let page = 1;
  let total = Infinity;
  while (rows.length < total) {
    const result = await getJson<ApiPage<T>>(`${path}${separator}page=${page}&page_size=${MAX_PAGE_SIZE}`);
    rows.push(...result.items);
    total = result.total;
    if (result.items.length === 0) {
      break;
    }
    page += 1;
  }
  return rows;
}
