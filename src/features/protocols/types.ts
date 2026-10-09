/**
 * Types of the proposed protocol API (docs/api-contract.md §1). They mirror its JSON.
 */

export type ProtocolStatus = 'processing' | 'in_review' | 'approved' | 'failed';

/** The three named processing stages, in order. */
export type ProcessingStage = 'extracting_text' | 'mapping_to_usdm' | 'validating';

export const PROCESSING_STAGES: readonly ProcessingStage[] = [
  'extracting_text',
  'mapping_to_usdm',
  'validating',
];

export type FileType = 'pdf' | 'docx';

export type FailureReason =
  'scanned_pdf_no_ocr' | 'encrypted_pdf' | 'corrupt_pdf' | 'timeout' | 'validation_failed';

export interface ProtocolFailure {
  /** The stage that was running when processing stopped. */
  stage: ProcessingStage;
  reason: FailureReason | null;
  detail: string | null;
  /** Blocking validation errors, when `reason` is `validation_failed`. */
  errors: string[];
}

export interface ProtocolSummary {
  id: string;
  /** Short study name, e.g. "ALPHA-301". */
  name: string;
  /** One line describing the study, e.g. "Phase 3 · Oncology". */
  title: string;
  file_name: string;
  file_type: FileType;
  /** Known once text extraction has finished. */
  page_count: number | null;
  uploaded_at: string; // ISO 8601
  status: ProtocolStatus;
  /** The stage being run while `processing`; null otherwise. */
  stage: ProcessingStage | null;
  /** Progress of the current stage, 0–100, while `processing`. */
  stage_progress: number | null;
  classes_total: number;
  classes_approved: number;
  /** Overall confidence, 0–100, once mapping has finished. */
  confidence: number | null;
  failure: ProtocolFailure | null;
  /** True once the approved USDM output has been stored in the repository. */
  stored: boolean;
}

export type LogLevel = 'info' | 'success' | 'warning' | 'error';

export interface LogEntry {
  at: string; // ISO 8601
  level: LogLevel;
  message: string;
}

export interface ProtocolDetail extends ProtocolSummary {
  log: LogEntry[];
}
