# Backend API contract

What this frontend expects from the backend
([`usdm_4_convertor_backend`](https://github.com/Lucifer0190/usdm_4_convertor_backend)).

| Part                                                   | Status                                                | Base URL setting                           |
| ------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------ |
| [Conversion API](#1-conversion-api-exists) (`/v1/*`)   | **Exists** (`src/usdm4_api/app.py`)                   | `VITE_CONVERT_API_URL` / `CONVERT_API_URL` |
| [CORS](#2-cors-needed)                                 | **Needed** — not configured today                     | —                                          |
| [Review API](#3-review-api-proposed) (`/api/review/*`) | **Proposed** — the review tool only serves HTML today | `VITE_REVIEW_API_URL` / `REVIEW_API_URL`   |

Until the backend changes land, run the frontend with mocks (`npm run dev:mock`); the mock
handlers in `src/mocks/` follow this document exactly.

---

## 1. Conversion API (exists)

Used as documented in the backend's `docs/api.md`. The frontend uses only the asynchronous
job endpoints, because a conversion takes minutes.

| Call                                                                       | Used for                                                                       |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `POST /v1/jobs` (multipart, field `file`) → `202 {"id", "status", "poll"}` | Upload a protocol PDF                                                          |
| `GET /v1/jobs/{id}?include_report=true`                                    | Poll every `VITE_JOB_POLL_INTERVAL_MS` (default 10 s) until `done` or `failed` |
| `GET /health`                                                              | Not used yet                                                                   |

Headers: `X-API-Key` when the user has set one in **Settings**.

Errors the UI explains to the user (see `src/features/convert/errorMessages.ts`):
`400`, `401`, `413`, `503` on upload; `404` (job expired) on poll; and, inside a failed job,
`http_status` 422 with `reason` = `corrupt_pdf` | `encrypted_pdf` | `scanned_pdf_no_ocr`
(or none, with `assembler_errors`), `504` (timeout), `500`.

## 2. CORS (needed)

The frontend is served from its own origin (e.g. `http://localhost:5173` in development), so
the browser blocks every call unless both backend services allow that origin. Proposed change,
in both `usdm4_api.app.create_app` and `usdm4_assure.review.app`:

```python
from fastapi.middleware.cors import CORSMiddleware

origins = [o.strip() for o in os.environ.get("USDM4_CORS_ORIGINS", "").split(",") if o.strip()]
if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,               # e.g. "http://localhost:5173,https://usdm4.example.com"
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type", "X-API-Key"],
        expose_headers=["X-Run-Id", "X-Converter"],
    )
```

Unset means no CORS headers, which keeps today's behaviour.

## 3. Review API (proposed)

A JSON version of the existing HTMX routes in `usdm4_assure/review/app.py`. Same data, same
rules (append-only audit store, edits need a reason and a reviewer id); only the response
format changes. All paths are relative to `REVIEW_API_URL`. Path segments are URL-encoded.

Errors use the usual FastAPI shape: `{"detail": "message"}` with `404` for an unknown source
or field, `422` for a missing or invalid body field.

### Types

`AuditRecord` is `AuditRecord.to_row()` from `contracts_audit.py`, with `bbox`,
`retrieval_config` and `verification` as JSON values rather than JSON text:

```ts
interface AuditRecord {
  record_id: string;
  run_id: string;
  event: 'extraction' | 'review_edit' | 'certify' | 'calibration';
  source_sha256: string;
  domain: string;
  field: string | null;
  timestamp_utc: string; // ISO 8601
  value: string | null;
  method: string | null;
  decision: 'auto_accept' | 'review' | 'block' | null;
  confidence: number | null;
  page: number | null;
  bbox: [number, number, number, number] | null;
  quote_text: string | null;
  verify_pass: 'exact' | 'normalized' | 'failed' | null;
  reviewer_id: string | null;
  prior_value: string | null;
  reason_for_change: string | null;
  signature_meaning: string | null;
  // ...the remaining AuditRecord columns may be included; the UI ignores them.
}

interface SourceSummary {
  // review/data.py SourceSummary
  source_sha256: string;
  pdf_path: string | null;
  n_records: number;
  n_fields: number;
  run_ids: string[];
  decision_summary: { auto_accept: number; review: number; block: number };
  certified: boolean;
}

interface DistanceSummary {
  // review/telemetry.py DistanceSummary
  n_fields: number;
  n_edited: number;
  mean_distance: number | null;
  mean_distance_of_edited: number | null;
}
```

### Endpoints

| Method and path                                                 | Replaces HTMX route                               | Response                                                                                                                                    |
| --------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/review/sources`                                       | `GET /`                                           | `SourceSummary[]`                                                                                                                           |
| `GET /api/review/sources/{sha}`                                 | `GET /source/{sha}`                               | `{ "summary": SourceSummary, "fields": AuditRecord[] }` — current value of every field, **already risk-sorted** (`review_data.risk_sorted`) |
| `GET /api/review/sources/{sha}/fields/{domain}/{field}/history` | `GET /source/{sha}/history/{domain}/{field}`      | `AuditRecord[]`, oldest first                                                                                                               |
| `GET /api/review/sources/{sha}/crop?page=&x0=&y0=&x1=&y1=`      | `GET /source/{sha}/crop`                          | `image/png` (unchanged)                                                                                                                     |
| `POST /api/review/sources/{sha}/fields/{domain}/{field}/edit`   | `POST /source/{sha}/fields/{domain}/{field}/edit` | body `{ "value", "reason", "reviewer_id" }` → the new `AuditRecord`                                                                         |
| `POST /api/review/sources/{sha}/certify`                        | `POST /source/{sha}/certify`                      | body `{ "reviewer_id", "signature_meaning" }` → `{ "record": AuditRecord, "telemetry": DistanceSummary }`                                   |

`signature_meaning` defaults to `"Reviewed and approved for submission"` when omitted, as today.
