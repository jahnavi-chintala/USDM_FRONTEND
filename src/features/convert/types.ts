/**
 * Types for the conversion API (`usdm4_api`, `/v1/*`). They mirror the backend's JSON;
 * see docs/api-contract.md and the backend's docs/api.md.
 */

export type JobStatus = 'queued' | 'running' | 'done' | 'failed';

export interface DecisionSummary {
  auto_accept: number;
  review: number;
  block: number;
}

/** One conformance gate: a summary, a skip note or an error (validate/gate.py). */
export interface GateResult {
  passed?: boolean | null;
  rules_run?: number | null;
  findings?: number | null;
  failed_rules?: string[];
  skipped?: string;
  error?: string;
}

export interface ValidationReport {
  structural: GateResult | null;
  d4k: GateResult | null;
  core: GateResult | null;
}

/** The quality summary returned next to the document with `include_report=true`. */
export interface ConversionReport {
  llm: boolean;
  core_requested: boolean;
  run_id: string;
  source_sha256: string;
  decision_summary: DecisionSummary;
  validation: ValidationReport | null;
  findings: number;
}

/** A USDM 4.0 wrapper document. Its schema is large; the UI treats it as opaque JSON. */
export type UsdmDocument = Record<string, unknown>;

export interface ConversionResult {
  usdm: UsdmDocument;
  report: ConversionReport;
}

/** Why a job failed. `reason` is set when the document itself is the cause. */
export interface JobError {
  detail: string;
  reason?: 'corrupt_pdf' | 'encrypted_pdf' | 'scanned_pdf_no_ocr' | string;
  assembler_errors?: unknown[];
  [key: string]: unknown;
}

export interface JobSubmitResponse {
  id: string;
  status: JobStatus;
  poll: string;
}

export interface JobStatusResponse {
  id: string;
  status: JobStatus;
  result?: ConversionResult;
  run_id?: string;
  error?: JobError;
  /** The status a direct `/v1/convert` call would have returned. */
  http_status?: number;
}
