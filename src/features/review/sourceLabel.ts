import type { SourceSummary } from './types';

/** The PDF path when known, otherwise a short form of the source's SHA-256. */
export function sourceLabel(source: Pick<SourceSummary, 'pdf_path' | 'source_sha256'>): string {
  return source.pdf_path ?? source.source_sha256.slice(0, 12);
}
