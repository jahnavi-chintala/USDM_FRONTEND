/**
 * An HTTP call that did not succeed.
 *
 * The backend answers errors as `{"detail": ..., "reason"?: ..., ...}` (FastAPI style).
 * `status` is 0 when the server could not be reached at all.
 */
export class ApiError extends Error {
  readonly status: number;
  /** Machine-readable cause, e.g. `corrupt_pdf`, when the backend provides one. */
  readonly reason?: string;
  /** The full error body, for screens that show extra details. */
  readonly body: Record<string, unknown>;

  constructor(status: number, message: string, body: Record<string, unknown> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.reason = typeof body.reason === 'string' ? body.reason : undefined;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** Turns an error body into a readable message. `detail` may be a string or a list/object. */
export function messageFromBody(body: Record<string, unknown>, fallback: string): string {
  const { detail } = body;
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) =>
        item && typeof item === 'object' && 'msg' in item ? String(item.msg) : JSON.stringify(item),
      )
      .filter(Boolean);
    if (messages.length) return messages.join('; ');
  }
  return fallback;
}

/** A readable message for any thrown value. */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong.';
}
