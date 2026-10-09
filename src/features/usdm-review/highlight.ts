export interface QuoteMark {
  id: string;
  quote: string;
}

export type Segment = { text: string; markId: string | null };

/**
 * Splits `text` into plain and highlighted parts: each quote found in it (ignoring case)
 * becomes a segment carrying that quote's id. Overlapping matches keep the earlier one.
 */
export function highlightQuotes(text: string, marks: QuoteMark[]): Segment[] {
  const lower = text.toLowerCase();
  const ranges = marks
    .filter((mark) => mark.quote.trim())
    .map((mark) => ({
      id: mark.id,
      start: lower.indexOf(mark.quote.toLowerCase()),
      length: mark.quote.length,
    }))
    .filter((range) => range.start >= 0)
    .sort((a, b) => a.start - b.start);

  const segments: Segment[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start < cursor) continue;
    if (range.start > cursor)
      segments.push({ text: text.slice(cursor, range.start), markId: null });
    segments.push({ text: text.slice(range.start, range.start + range.length), markId: range.id });
    cursor = range.start + range.length;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), markId: null });
  return segments;
}
