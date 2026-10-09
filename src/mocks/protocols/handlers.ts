import { delay, http, HttpResponse } from 'msw';

import { config } from '@/config/env';

import {
  changeClass,
  createProtocol,
  getClasses,
  getProtocol,
  listProtocols,
  restartProtocol,
  sourcePage,
  storeProtocol,
  usdmDocument,
  type ClassChange,
} from './db';

/**
 * Mock of the proposed protocol API (docs/api-contract.md). Upload refusals are chosen by
 * file name, like the processing outcomes in db.ts:
 *   - contains "toolarge"     -> 413
 *   - contains "unauthorised" -> 401
 *   - contains "unavailable"  -> 503
 *   - not .pdf / .docx        -> 400
 */

const api = `${config.apiUrl}/api/protocols`;
const notFound = () => HttpResponse.json({ detail: 'Protocol not found.' }, { status: 404 });
const missingReviewer = () =>
  HttpResponse.json({ detail: 'reviewer_id is required.' }, { status: 422 });

async function reviewerOf(request: Request): Promise<Record<string, unknown> | null> {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  return body && typeof body.reviewer_id === 'string' && body.reviewer_id.trim() ? body : null;
}

export const protocolHandlers = [
  http.get(api, async () => {
    await delay(150);
    return HttpResponse.json(listProtocols());
  }),

  http.post(api, async ({ request }) => {
    await delay(400);
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return HttpResponse.json({ detail: 'Field "file" is required.' }, { status: 400 });
    }
    const name = file.name.toLowerCase();
    if (name.includes('toolarge')) {
      return HttpResponse.json({ detail: 'File is over 60 MB.' }, { status: 413 });
    }
    if (name.includes('unauthorised')) {
      return HttpResponse.json({ detail: 'Invalid API key.' }, { status: 401 });
    }
    if (name.includes('unavailable')) {
      return HttpResponse.json({ detail: 'Pipeline not configured.' }, { status: 503 });
    }
    const type = name.endsWith('.pdf') ? 'pdf' : name.endsWith('.docx') ? 'docx' : null;
    if (!type) {
      return HttpResponse.json({ detail: 'Only PDF and Word files.' }, { status: 400 });
    }
    return HttpResponse.json(createProtocol(file.name, type), { status: 201 });
  }),

  http.get(`${api}/:id`, async ({ params }) => {
    await delay(100);
    const protocol = getProtocol(String(params.id));
    return protocol ? HttpResponse.json(protocol) : notFound();
  }),

  http.post(`${api}/:id/retry`, async ({ params }) => {
    const summary = restartProtocol(String(params.id));
    return summary ? HttpResponse.json(summary) : notFound();
  }),

  http.post(`${api}/:id/reextract`, async ({ params, request }) => {
    if (!(await reviewerOf(request))) return missingReviewer();
    const summary = restartProtocol(String(params.id));
    return summary ? HttpResponse.json(summary) : notFound();
  }),

  http.get(`${api}/:id/classes`, async ({ params }) => {
    await delay(150);
    const classes = getClasses(String(params.id));
    return classes ? HttpResponse.json(classes) : notFound();
  }),

  http.post(`${api}/:id/classes/:classId/:action`, async ({ params, request }) => {
    const action = String(params.action);
    if (!['approve', 'reject', 'reextract'].includes(action)) return notFound();
    if (!(await reviewerOf(request))) return missingReviewer();
    await delay(200);
    const updated = changeClass(String(params.id), String(params.classId), {
      kind: action,
    } as ClassChange);
    return updated ? HttpResponse.json(updated) : notFound();
  }),

  http.put(`${api}/:id/classes/:classId/fields`, async ({ params, request }) => {
    const body = await reviewerOf(request);
    if (!body) return missingReviewer();
    if (typeof body.reason !== 'string' || !body.reason.trim()) {
      return HttpResponse.json({ detail: 'reason is required.' }, { status: 422 });
    }
    await delay(200);
    const updated = changeClass(String(params.id), String(params.classId), {
      kind: 'edit',
      values: (body.values ?? {}) as Record<string, string>,
    });
    return updated ? HttpResponse.json(updated) : notFound();
  }),

  http.get(`${api}/:id/pages/:page`, async ({ params }) => {
    await delay(100);
    const page = sourcePage(String(params.id), Number(params.page));
    return page ? HttpResponse.json(page) : notFound();
  }),

  http.get(`${api}/:id/usdm`, ({ params }) => {
    const usdm = usdmDocument(String(params.id));
    return usdm ? HttpResponse.json(usdm) : notFound();
  }),

  http.post(`${api}/:id/store`, async ({ params, request }) => {
    if (!(await reviewerOf(request))) return missingReviewer();
    await delay(300);
    const summary = storeProtocol(String(params.id));
    return summary ? HttpResponse.json(summary) : notFound();
  }),
];
