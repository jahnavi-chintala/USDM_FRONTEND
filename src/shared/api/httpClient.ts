import { ApiError, messageFromBody } from './ApiError';

export type QueryParams = Record<string, string | number | boolean | undefined>;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT';
  query?: QueryParams;
  /** Sent as JSON unless it is `FormData`. */
  body?: unknown;
  signal?: AbortSignal;
}

export interface HttpClient {
  /** Absolute URL for `path`, e.g. for an `<img src>` that cannot send headers. */
  url: (path: string, query?: QueryParams) => string;
  request: <T>(path: string, options?: RequestOptions) => Promise<T>;
}

export interface HttpClientOptions {
  baseUrl: string;
  /** Headers added to every request, read at call time (e.g. the current API key). */
  getHeaders?: () => Record<string, string>;
}

function buildUrl(baseUrl: string, path: string, query?: QueryParams): string {
  const url = new URL(`${baseUrl}${path}`);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });
  return url.toString();
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** A thin `fetch` wrapper: base URL, JSON in and out, and errors as {@link ApiError}. */
export function createHttpClient({ baseUrl, getHeaders }: HttpClientOptions): HttpClient {
  const url = (path: string, query?: QueryParams) => buildUrl(baseUrl, path, query);

  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', query, body, signal } = options;
    const headers: Record<string, string> = { Accept: 'application/json', ...getHeaders?.() };
    let payload: BodyInit | undefined;
    if (body instanceof FormData) {
      payload = body;
    } else if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetch(url(path, query), { method, headers, body: payload, signal });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      throw new ApiError(
        0,
        `Cannot reach the server at ${baseUrl}. Check that it is running and allows this site (CORS).`,
      );
    }

    const data = await readBody(response);
    if (!response.ok) {
      const errorBody =
        data && typeof data === 'object' ? (data as Record<string, unknown>) : { detail: data };
      throw new ApiError(
        response.status,
        messageFromBody(errorBody, `Request failed (${response.status} ${response.statusText})`),
        errorBody,
      );
    }
    return data as T;
  }

  return { url, request };
}
