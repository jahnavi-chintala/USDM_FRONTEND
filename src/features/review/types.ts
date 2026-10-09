/**
 * Types for the review API (`/api/review/*`). They mirror the backend's audit records
 * (usdm4_assure/contracts_audit.py, review/data.py, review/telemetry.py).
 * The API itself is still a proposal: see docs/api-contract.md, section 3.
 */

export type Decision = 'auto_accept' | 'review' | 'block';
export type AuditEvent = 'extraction' | 'review_edit' | 'certify' | 'calibration';
export type VerifyPass = 'exact' | 'normalized' | 'failed';
/** [x0, y0, x1, y1] in PDF points on `page`. */
export type BBox = [number, number, number, number];

/** One immutable audit-trail record. A field's current value is its latest record. */
export interface AuditRecord {
  record_id: string;
  run_id: string;
  event: AuditEvent;
  source_sha256: string;
  domain: string;
  field: string | null;
  timestamp_utc: string;
  value: string | null;
  method: string | null;
  decision: Decision | null;
  confidence: number | null;
  page: number | null;
  bbox: BBox | null;
  quote_text: string | null;
  verify_pass: VerifyPass | null;
  reviewer_id: string | null;
  prior_value: string | null;
  reason_for_change: string | null;
  signature_meaning: string | null;
}

/** One source PDF with audit history (a row of the sources list). */
export interface SourceSummary {
  source_sha256: string;
  pdf_path: string | null;
  n_records: number;
  n_fields: number;
  run_ids: string[];
  decision_summary: Record<Decision, number>;
  certified: boolean;
}

export interface SourceDetail {
  summary: SourceSummary;
  /** The current record of every field, sorted worst-first by the backend. */
  fields: AuditRecord[];
}

/** How much review changed the pipeline's values (0 = untouched, 1 = rewritten). */
export interface DistanceSummary {
  n_fields: number;
  n_edited: number;
  mean_distance: number | null;
  mean_distance_of_edited: number | null;
}

export interface EditFieldRequest {
  value: string;
  reason: string;
  reviewer_id: string;
}

export interface CertifyRequest {
  reviewer_id: string;
  signature_meaning: string;
}

export interface CertifyResponse {
  record: AuditRecord;
  telemetry: DistanceSummary;
}

export const DEFAULT_SIGNATURE_MEANING = 'Reviewed and approved for submission';
