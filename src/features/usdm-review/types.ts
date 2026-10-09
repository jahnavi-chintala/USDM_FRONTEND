/**
 * Types of the proposed class review API (docs/api-contract.md §2). They mirror its JSON.
 */

export type ClassStatus = 'pending' | 'approved' | 'rejected' | 'edited' | 'reextracting';

export interface ExtractedField {
  id: string;
  label: string;
  value: string;
  /** The verbatim text of the protocol the value was taken from. */
  quote: string;
  page: number;
  /** True when the quote was found word for word on `page`. */
  quote_located: boolean;
}

/** A Schedule of Activities as extracted: which activity happens at which visit. */
export interface SoaGrid {
  visits: string[];
  activities: { name: string; scheduled: boolean[] }[];
}

/** One reviewable group of the USDM output, e.g. "Study Design" or "Arms". */
export interface UsdmClass {
  id: string;
  name: string;
  /** The USDM 4.0 classes it fills, e.g. ["StudyArm"]. */
  usdm_classes: string[];
  /** The source page most of its values come from. */
  page: number;
  /** The model's own confidence, 0–100, from the latest extraction. */
  model_confidence: number;
  status: ClassStatus;
  fields: ExtractedField[];
  soa: SoaGrid | null;
}

export interface SourcePage {
  page: number;
  page_count: number;
  heading: string | null;
  paragraphs: string[];
}

/** What the review screens need to know about the protocol itself. */
export interface ReviewProtocol {
  id: string;
  name: string;
  title: string;
  file_name: string;
  page_count: number | null;
  status: string;
  stored: boolean;
}

export interface ReviewerRequest {
  reviewer_id: string;
}

export interface EditClassRequest extends ReviewerRequest {
  /** New value per field id; fields left out keep their value. */
  values: Record<string, string>;
  reason: string;
}
