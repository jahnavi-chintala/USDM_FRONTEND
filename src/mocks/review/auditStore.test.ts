import type { AuditRecord } from '@/features/review/types';

import { currentFields, riskSorted, telemetry } from './auditStore';
import { blankRecord } from './fixtures';

const rec = (field: string, extra: Partial<AuditRecord> = {}) =>
  blankRecord({ event: 'extraction', source_sha256: 's', domain: 'd', field, run_id: 'r' }, extra);

// The mock must sort and summarise exactly like usdm4_assure/review/data.py, or the
// screens would be tested against behaviour the real backend does not have.
describe('mock audit store', () => {
  it('keeps the latest record per field and drops run-level records', () => {
    const list = [
      rec('a', { value: '1' }),
      rec('a', { value: '2', event: 'review_edit' }),
      blankRecord({
        event: 'certify',
        source_sha256: 's',
        domain: 'ALL',
        field: null,
        run_id: 'r',
      }),
    ];
    expect(currentFields(list).map((r) => r.value)).toEqual(['2']);
  });

  it('sorts block, review, auto-accept, then by confidence ascending', () => {
    const sorted = riskSorted([
      rec('ok', { decision: 'auto_accept', confidence: 0.9 }),
      rec('r-high', { decision: 'review', confidence: 0.6 }),
      rec('blocked', { decision: 'block', confidence: null }),
      rec('r-low', { decision: 'review', confidence: 0.3 }),
    ]);
    expect(sorted.map((r) => r.field)).toEqual(['blocked', 'r-low', 'r-high', 'ok']);
  });

  it('measures how far review moved each field', () => {
    const summary = telemetry([
      rec('a', { value: 'abcd' }),
      rec('a', { value: 'abcx', event: 'review_edit' }),
      rec('b', { value: 'same' }),
    ]);
    expect(summary).toEqual({
      n_fields: 2,
      n_edited: 1,
      mean_distance: 0.125,
      mean_distance_of_edited: 0.25,
    });
  });
});
