import type {
  AuditRecord,
  Decision,
  DistanceSummary,
  SourceSummary,
} from '@/features/review/types';

import { initialAuditRecords, SOURCE_PATHS } from './fixtures';

/**
 * An in-memory, append-only copy of the backend's audit store and its read-side queries
 * (usdm4_assure/review/data.py and telemetry.py), so the mock behaves like the real API.
 */

let records = initialAuditRecords();

export function resetAuditStore(): void {
  records = initialAuditRecords();
}

export function readAll(sha: string): AuditRecord[] | undefined {
  return records[sha];
}

export function append(sha: string, record: AuditRecord): void {
  (records[sha] ??= []).push(record);
}

export function allSources(): string[] {
  return Object.keys(records);
}

/** The latest record for every (domain, field); run-level records are excluded. */
export function currentFields(list: AuditRecord[]): AuditRecord[] {
  const current = new Map<string, AuditRecord>();
  list.forEach((record) => {
    if (record.field !== null) current.set(`${record.domain}\u0000${record.field}`, record);
  });
  return [...current.values()];
}

const RISK: Record<Decision, number> = { block: 0, review: 1, auto_accept: 2 };

/** Worst-first: block, review, auto-accept; ties by confidence ascending. */
export function riskSorted(list: AuditRecord[]): AuditRecord[] {
  const key = (r: AuditRecord) => [r.decision ? RISK[r.decision] : 1, r.confidence ?? 0] as const;
  return [...list].sort((a, b) => key(a)[0] - key(b)[0] || key(a)[1] - key(b)[1]);
}

export function summarize(sha: string, list: AuditRecord[]): SourceSummary {
  const current = currentFields(list);
  const decision_summary = { auto_accept: 0, review: 0, block: 0 };
  current.forEach((r) => {
    if (r.decision) decision_summary[r.decision] += 1;
  });
  return {
    source_sha256: sha,
    pdf_path: SOURCE_PATHS[sha] ?? null,
    n_records: list.length,
    n_fields: current.length,
    run_ids: [...new Set(list.map((r) => r.run_id))].sort(),
    decision_summary,
    certified: list.some((r) => r.event === 'certify'),
  };
}

function levenshtein(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0]!;
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j]!;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length]!;
}

/** Normalized edit distance between each field's extracted and current value. */
export function telemetry(list: AuditRecord[]): DistanceSummary {
  const byField = new Map<string, AuditRecord[]>();
  list.forEach((r) => {
    if (r.field === null) return;
    const key = `${r.domain}\u0000${r.field}`;
    byField.set(key, [...(byField.get(key) ?? []), r]);
  });
  const distances = [...byField.values()].map((history) => {
    const original = history[0]?.value ?? '';
    const final = history[history.length - 1]?.value ?? '';
    const longest = Math.max(original.length, final.length);
    return {
      edited: history.some((r) => r.event === 'review_edit'),
      distance: longest === 0 ? 0 : levenshtein(original, final) / longest,
    };
  });
  const edited = distances.filter((d) => d.edited);
  const mean = (values: number[]) =>
    values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : null;
  return {
    n_fields: distances.length,
    n_edited: edited.length,
    mean_distance: mean(distances.map((d) => d.distance)),
    mean_distance_of_edited: mean(edited.map((d) => d.distance)),
  };
}
