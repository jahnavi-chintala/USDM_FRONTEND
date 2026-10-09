# Backend API contract

What this frontend expects from the backend
([`usdm_4_convertor_backend`](https://github.com/Lucifer0190/usdm_4_convertor_backend)).
The screens follow the **iDigitise Protocol UI** design: protocols are uploaded (one or
several, PDF or Word), processed in three named stages, reviewed **per USDM class**, then
downloaded or stored.

| Part                                                        | Status                        |
| ----------------------------------------------------------- | ----------------------------- |
| [Protocol API](#1-protocol-api-proposed) (`/api/protocols`) | **Proposed** — see gaps below |
| [Class review API](#2-class-review-api-proposed)            | **Proposed** — does not exist |
| [CORS](#3-cors-needed)                                      | **Needed** — not configured   |

All paths are relative to `API_URL` (`VITE_API_URL` at build time). Until the backend
implements them, run the frontend with mocks (`npm run dev:mock`); the handlers in
`src/mocks/protocols/` follow this document exactly.

Every request carries `X-API-Key` when the user has set one in **Settings**. Errors use the
FastAPI shape `{"detail": "message", "reason"?: "code"}`. Path segments are URL-encoded.

### What the backend has today, and what is missing

The existing `/v1/jobs` API converts one PDF in memory and reports
`queued | running | done | failed`. To serve these screens it needs:

1. **A database of protocols.** Jobs live in memory for about an hour, but Home lists every
   protocol (In Progress and Approved) and keeps review decisions.
2. **Word (`.docx`) upload.** The API accepts PDF only.
3. **The three named stages** (`extracting_text`, `mapping_to_usdm`, `validating`) with a
   progress figure and log lines, instead of only `running`.
4. **Review per USDM class** (approve, reject, edit, re-extract) with an audit trail. The
   current review tool works per field and serves HTML only.
5. **Source pages as text**, to highlight each value's verbatim quote.
6. **Store to database** for an approved protocol.

Already supported and reused: the failure reasons `corrupt_pdf`, `encrypted_pdf`,
`scanned_pdf_no_ocr`, the 15-minute timeout and the 60 MB limit.

---

## 1. Protocol API (proposed)

### Types

```ts
type ProtocolStatus = 'processing' | 'in_review' | 'approved' | 'failed';
type ProcessingStage = 'extracting_text' | 'mapping_to_usdm' | 'validating';
type FailureReason =
  'scanned_pdf_no_ocr' | 'encrypted_pdf' | 'corrupt_pdf' | 'timeout' | 'validation_failed';

interface ProtocolSummary {
  id: string;
  name: string; // short study name, e.g. "ALPHA-301"
  title: string; // one line, e.g. "Phase 3 · Oncology · Zelvatinib vs placebo"
  file_name: string;
  file_type: 'pdf' | 'docx';
  page_count: number | null; // known once text extraction has finished
  uploaded_at: string; // ISO 8601
  status: ProtocolStatus;
  stage: ProcessingStage | null; // while processing
  stage_progress: number | null; // 0–100, while processing
  classes_total: number;
  classes_approved: number;
  confidence: number | null; // 0–100, see "Confidence" below
  failure: {
    stage: ProcessingStage;
    reason: FailureReason | null;
    detail: string | null;
    errors: string[]; // blocking validation errors
  } | null;
  stored: boolean; // approved output saved in the repository
}

interface ProtocolDetail extends ProtocolSummary {
  log: { at: string; level: 'info' | 'success' | 'warning' | 'error'; message: string }[];
}
```

### Endpoints

| Method and path                      | Body                                     | Response                                                                        |
| ------------------------------------ | ---------------------------------------- | ------------------------------------------------------------------------------- |
| `GET /api/protocols`                 | —                                        | `ProtocolSummary[]`                                                             |
| `POST /api/protocols`                | multipart, field `file` (PDF or `.docx`) | `201 ProtocolSummary` (status `processing`)                                     |
| `GET /api/protocols/{id}`            | —                                        | `ProtocolDetail`                                                                |
| `POST /api/protocols/{id}/retry`     | —                                        | `ProtocolSummary`: processing restarts on the uploaded file                     |
| `POST /api/protocols/{id}/reextract` | `{ "reviewer_id" }`                      | `ProtocolSummary`: processing restarts and **every review decision is cleared** |
| `GET /api/protocols/{id}/pages/{n}`  | —                                        | `{ "page", "page_count", "heading": string \| null, "paragraphs": string[] }`   |
| `GET /api/protocols/{id}/usdm`       | —                                        | The USDM 4.0 JSON document                                                      |
| `POST /api/protocols/{id}/store`     | `{ "reviewer_id" }`                      | `ProtocolSummary` with `stored: true`                                           |

The app polls `GET /api/protocols/{id}` every `VITE_POLL_INTERVAL_MS` (default 10 s) while the
protocol is `processing`, and the list while any protocol is.

**Upload errors** (shown per file on the upload page): `400` not a PDF or Word file, `401`
API key refused, `413` over 60 MB, `503` service not configured.

**Source pages**: the text of one page, in reading order. The UI highlights each field's
`quote` wherever it appears verbatim (ignoring case), so `quote` must be the exact source text.

## 2. Class review API (proposed)

A protocol in `in_review` has a list of classes, each grouping the values of one or more
USDM classes. Every decision is appended to the audit trail with the reviewer id; the
protocol becomes `approved` when its last class is approved.

```ts
type ClassStatus = 'pending' | 'approved' | 'rejected' | 'edited' | 'reextracting';

interface UsdmClass {
  id: string; // e.g. "study-design"
  name: string; // e.g. "Study Design"
  usdm_classes: string[]; // e.g. ["InterventionalStudyDesign"]
  page: number; // main source page
  model_confidence: number; // 0–100, from the latest extraction
  status: ClassStatus;
  fields: {
    id: string;
    label: string;
    value: string;
    quote: string; // verbatim source text
    page: number;
    quote_located: boolean; // quote found word for word on `page`
  }[];
  soa: { visits: string[]; activities: { name: string; scheduled: boolean[] }[] } | null;
}
```

| Method and path                                      | Body                                                                   | Response                     |
| ---------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------- |
| `GET /api/protocols/{id}/classes`                    | —                                                                      | `UsdmClass[]`                |
| `POST /api/protocols/{id}/classes/{class}/approve`   | `{ "reviewer_id" }`                                                    | `UsdmClass` (`approved`)     |
| `POST /api/protocols/{id}/classes/{class}/reject`    | `{ "reviewer_id" }`                                                    | `UsdmClass` (`rejected`)     |
| `PUT /api/protocols/{id}/classes/{class}/fields`     | `{ "reviewer_id", "reason", "values": { "<field id>": "new value" } }` | `UsdmClass` (`edited`)       |
| `POST /api/protocols/{id}/classes/{class}/reextract` | `{ "reviewer_id" }`                                                    | `UsdmClass` (`reextracting`) |

`reason` is required for an edit (`422` otherwise). An edited class still needs an explicit
approval. A class being re-extracted is polled through `GET .../classes` until it is
`pending` again, with its new values and `model_confidence`.

### Confidence

To be confirmed with the product owner (from the design notes). Per class: approved 100,
edited 95, rejected at most 30, otherwise `model_confidence`. A protocol's `confidence` is
the rounded average over its classes. The frontend computes the same figures live
(`src/features/usdm-review/confidence.ts`) as the reviewer works.

## 3. CORS (needed)

The frontend is served from its own origin (e.g. `http://localhost:5173` in development), so
the browser blocks every call unless the backend allows that origin:

```python
from fastapi.middleware.cors import CORSMiddleware

origins = [o.strip() for o in os.environ.get("USDM4_CORS_ORIGINS", "").split(",") if o.strip()]
if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,               # e.g. "http://localhost:5173,https://idigitise.example.com"
        allow_methods=["GET", "POST", "PUT"],
        allow_headers=["Content-Type", "X-API-Key"],
    )
```

Unset means no CORS headers, which keeps today's behaviour.
