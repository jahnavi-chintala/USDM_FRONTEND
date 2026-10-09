import { http, HttpResponse } from 'msw';

import { server } from '@/mocks/server';

import { ApiError } from './ApiError';
import { createHttpClient } from './httpClient';

const BASE = 'http://api.test';

describe('createHttpClient', () => {
  it('sends headers from getHeaders and parses JSON', async () => {
    server.use(
      http.get(`${BASE}/things`, ({ request }) =>
        HttpResponse.json({
          key: request.headers.get('X-API-Key'),
          page: new URL(request.url).searchParams.get('page'),
        }),
      ),
    );
    const client = createHttpClient({ baseUrl: BASE, getHeaders: () => ({ 'X-API-Key': 'k1' }) });
    await expect(
      client.request('/things', { query: { page: 2, skip: undefined } }),
    ).resolves.toEqual({ key: 'k1', page: '2' });
  });

  it('turns an error body into an ApiError with detail and reason', async () => {
    server.use(
      http.post(`${BASE}/convert`, () =>
        HttpResponse.json(
          { detail: 'The PDF is encrypted.', reason: 'encrypted_pdf' },
          { status: 422 },
        ),
      ),
    );
    const client = createHttpClient({ baseUrl: BASE });
    const error = await client.request('/convert', { method: 'POST' }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 422,
      reason: 'encrypted_pdf',
      message: 'The PDF is encrypted.',
    });
  });

  it('reports an unreachable server as a network error', async () => {
    server.use(http.get(`${BASE}/down`, () => HttpResponse.error()));
    const client = createHttpClient({ baseUrl: BASE });
    const error = (await client.request('/down').catch((e: unknown) => e)) as ApiError;
    expect(error.isNetworkError).toBe(true);
    expect(error.message).toContain('Cannot reach the server');
  });

  it('builds absolute URLs with query parameters', () => {
    const client = createHttpClient({ baseUrl: BASE });
    expect(client.url('/crop', { page: 3, x0: 1.5 })).toBe(`${BASE}/crop?page=3&x0=1.5`);
  });
});
