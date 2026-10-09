import { delay, http, HttpResponse } from 'msw';

import { config } from '@/config/env';
import type { CertifyRequest, EditFieldRequest } from '@/features/review/types';
import { DEFAULT_SIGNATURE_MEANING } from '@/features/review/types';

import {
  append,
  allSources,
  currentFields,
  readAll,
  riskSorted,
  summarize,
  telemetry,
} from './auditStore';
import { blankRecord } from './fixtures';

/** Mock of the proposed review API (docs/api-contract.md, section 3). */

const base = `${config.reviewApiUrl}/api/review/sources`;

function fieldParams(params: Record<string, unknown>) {
  return { sha: String(params.sha), domain: String(params.domain), field: String(params.field) };
}

const notFound = (detail: string) => HttpResponse.json({ detail }, { status: 404 });

function missing(body: Record<string, unknown>, keys: string[]): string | undefined {
  return keys.find((key) => typeof body[key] !== 'string' || !(body[key] as string).trim());
}

/** A stand-in for the PNG crop the backend renders from the source PDF. */
function cropSvg(page: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="80" viewBox="0 0 480 80">
  <rect width="480" height="80" fill="#fffde7" stroke="#bbb"/>
  <text x="16" y="34" font-family="serif" font-size="16" fill="#333">Source PDF crop (mock)</text>
  <text x="16" y="58" font-family="sans-serif" font-size="12" fill="#777">page ${page}</text>
</svg>`;
}

export const reviewHandlers = [
  http.get(base, async () => {
    await delay(150);
    return HttpResponse.json(
      allSources()
        .map((sha) => summarize(sha, readAll(sha) ?? []))
        .filter((s) => s.n_records > 0),
    );
  }),

  http.get(`${base}/:sha`, async ({ params }) => {
    await delay(150);
    const sha = String(params.sha);
    const list = readAll(sha);
    if (!list?.length) return notFound(`no audit records for source ${sha}`);
    return HttpResponse.json({
      summary: summarize(sha, list),
      fields: riskSorted(currentFields(list)),
    });
  }),

  http.get(`${base}/:sha/fields/:domain/:field/history`, async ({ params }) => {
    await delay(100);
    const { sha, domain, field } = fieldParams(params);
    const history = (readAll(sha) ?? []).filter((r) => r.domain === domain && r.field === field);
    if (!history.length) return notFound(`no records for ${domain}.${field}`);
    return HttpResponse.json(history);
  }),

  http.get(`${base}/:sha/crop`, ({ params, request }) => {
    if (!readAll(String(params.sha))) return notFound('no source PDF is recorded for this sha256');
    const page = new URL(request.url).searchParams.get('page') ?? '?';
    return new HttpResponse(cropSvg(page), { headers: { 'Content-Type': 'image/svg+xml' } });
  }),

  http.post(`${base}/:sha/fields/:domain/:field/edit`, async ({ params, request }) => {
    await delay(150);
    const { sha, domain, field } = fieldParams(params);
    const list = readAll(sha);
    if (!list?.length) return notFound(`no audit records for source ${sha}`);
    const body = (await request.json()) as EditFieldRequest;
    const absent = missing({ ...body }, ['value', 'reason', 'reviewer_id']);
    if (absent) return HttpResponse.json({ detail: `${absent} is required` }, { status: 422 });
    const prior = currentFields(list).find((r) => r.domain === domain && r.field === field);
    const record = blankRecord(
      { event: 'review_edit', source_sha256: sha, domain, field, run_id: 'review' },
      {
        value: body.value,
        method: 'human',
        decision: 'auto_accept',
        confidence: 1,
        reviewer_id: body.reviewer_id,
        prior_value: prior?.value ?? null,
        reason_for_change: body.reason,
      },
    );
    append(sha, record);
    return HttpResponse.json(record);
  }),

  http.post(`${base}/:sha/certify`, async ({ params, request }) => {
    await delay(200);
    const sha = String(params.sha);
    const list = readAll(sha);
    if (!list?.length) return notFound(`no audit records for source ${sha}`);
    const body = (await request.json()) as Partial<CertifyRequest>;
    if (missing({ ...body }, ['reviewer_id'])) {
      return HttpResponse.json({ detail: 'reviewer_id is required' }, { status: 422 });
    }
    const record = blankRecord(
      { event: 'certify', source_sha256: sha, domain: 'ALL', field: null, run_id: 'review' },
      {
        reviewer_id: body.reviewer_id ?? null,
        signature_meaning: body.signature_meaning || DEFAULT_SIGNATURE_MEANING,
      },
    );
    append(sha, record);
    return HttpResponse.json({ record, telemetry: telemetry(readAll(sha) ?? []) });
  }),
];
