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
