import type { AuditRecord, BBox, Decision, VerifyPass } from '@/features/review/types';

/** Synthetic audit records for the review mock. No real protocol data. */

export const SHA_OPEN = 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f9';
export const SHA_CERTIFIED = 'f0e1d2c3b4a5968778695a4b3c2d1e0ff0e1d2c3b4a5968778695a4b3c2d1e0f';

export const SOURCE_PATHS: Record<string, string> = {
  [SHA_OPEN]: 'data/protocols/ZV-210-201_amendment2.pdf',
  [SHA_CERTIFIED]: 'data/protocols/ZK-415-102.pdf',
};

interface FieldSeed {
  domain: string;
  field: string;
  value: string | null;
  decision: Decision;
  confidence: number | null;
  method: string;
  page?: number;
  quote?: string;
  verify?: VerifyPass;
}

const OPEN_FIELDS: FieldSeed[] = [
  {
    domain: 'metadata',
    field: 'sponsor_name',
    value: 'Zenvara Therapeutics',
    decision: 'auto_accept',
    confidence: 0.97,
    method: 'det_text',
    page: 1,
    quote: 'Sponsor: Zenvara Therapeutics, Inc.',
    verify: 'exact',
  },
  {
    domain: 'metadata',
    field: 'protocol_id',
    value: 'ZV-210-201',
    decision: 'auto_accept',
    confidence: 0.99,
    method: 'det_text',
    page: 1,
    quote: 'Protocol Number: ZV-210-201',
    verify: 'exact',
  },
  {
    domain: 'metadata',
    field: 'phase',
    value: 'Phase 2',
    decision: 'auto_accept',
    confidence: 0.93,
    method: 'llm_frontier',
    page: 1,
    quote: 'A Phase 2, Randomised, Double-Blind Study',
    verify: 'exact',
  },
  {
    domain: 'metadata',
    field: 'sponsor_address',
    value: null,
    decision: 'block',
    confidence: null,
    method: 'llm_frontier',
  },
  {
    domain: 'design',
    field: 'arm_count',
    value: '2',
    decision: 'review',
    confidence: 0.41,
    method: 'llm_frontier',
    page: 12,
    quote: 'Participants will be randomised 2:1 to ZV-210 or placebo',
    verify: 'normalized',
  },
  {
    domain: 'design',
    field: 'blinding',
    value: 'Double blind',
    decision: 'auto_accept',
    confidence: 0.88,
    method: 'det_text',
    page: 11,
    quote: 'double-blind',
    verify: 'exact',
  },
  {
    domain: 'eligibility',
    field: 'min_age',
    value: '18 years',
    decision: 'review',
    confidence: 0.62,
    method: 'llm_frontier',
    page: 24,
    quote: 'Aged ≥ 18 years at the time of signing',
    verify: 'normalized',
  },
  {
    domain: 'eligibility',
    field: 'inclusion_count',
    value: '14',
    decision: 'review',
    confidence: 0.55,
    method: 'det_text',
    page: 24,
    quote: 'Inclusion Criteria',
    verify: 'exact',
  },
  {
    domain: 'objectives',
    field: 'primary_endpoint',
    value: 'Objective response rate per RECIST 1.1',
    decision: 'review',
    confidence: 0.47,
    method: 'llm_frontier',
    page: 9,
    quote: 'ORR, defined as the proportion of participants with CR or PR per RECIST 1.1',
    verify: 'normalized',
  },
  {
    domain: 'estimands',
    field: 'intercurrent_event',
    value: 'Treatment discontinuation',
    decision: 'block',
    confidence: 0.18,
    method: 'llm_frontier',
    page: 10,
    quote: 'discontinuation of study intervention',
    verify: 'failed',
  },
  {
    domain: 'sites',
    field: 'site_count',
    value: '42',
    decision: 'auto_accept',
    confidence: 0.81,
    method: 'det_table',
    page: 31,
    quote: 'approximately 42 sites',
    verify: 'exact',
  },
];

const CERTIFIED_FIELDS: FieldSeed[] = [
  {
    domain: 'metadata',
    field: 'protocol_id',
    value: 'ZK-415-102',
    decision: 'auto_accept',
    confidence: 0.98,
    method: 'det_text',
    page: 1,
    quote: 'Protocol ZK-415-102',
    verify: 'exact',
  },
  {
    domain: 'design',
    field: 'arm_count',
    value: '3',
    decision: 'auto_accept',
    confidence: 0.9,
    method: 'llm_frontier',
    page: 8,
    quote: 'three treatment arms',
    verify: 'exact',
  },
];

const BLANK: Omit<
  AuditRecord,
  'record_id' | 'run_id' | 'event' | 'source_sha256' | 'domain' | 'field' | 'timestamp_utc'
> = {
  value: null,
  method: null,
  decision: null,
  confidence: null,
  page: null,
  bbox: null,
  quote_text: null,
  verify_pass: null,
  reviewer_id: null,
  prior_value: null,
  reason_for_change: null,
  signature_meaning: null,
};

export function blankRecord(
  base: Pick<AuditRecord, 'event' | 'source_sha256' | 'domain' | 'field' | 'run_id'>,
  extra: Partial<AuditRecord> = {},
): AuditRecord {
  return {
    ...BLANK,
    record_id: crypto.randomUUID().replace(/-/g, ''),
    timestamp_utc: new Date().toISOString(),
    ...base,
    ...extra,
  };
}

function extraction(sha: string, seed: FieldSeed, index: number): AuditRecord {
  const bbox: BBox | null = seed.page ? [72, 120 + index * 18, 520, 150 + index * 18] : null;
  return blankRecord(
    {
      event: 'extraction',
      source_sha256: sha,
      domain: seed.domain,
      field: seed.field,
      run_id: 'run-0001',
    },
    {
      timestamp_utc: '2026-10-08T09:15:00.000000+00:00',
      value: seed.value,
      method: seed.method,
      decision: seed.decision,
      confidence: seed.confidence,
      page: seed.page ?? null,
      bbox,
      quote_text: seed.quote ?? null,
      verify_pass: seed.verify ?? null,
    },
  );
}

/** Fresh audit records per source, oldest first. */
export function initialAuditRecords(): Record<string, AuditRecord[]> {
  const certified = CERTIFIED_FIELDS.map((seed, i) => extraction(SHA_CERTIFIED, seed, i));
  certified.push(
    blankRecord(
      {
        event: 'certify',
        source_sha256: SHA_CERTIFIED,
        domain: 'ALL',
        field: null,
        run_id: 'review',
      },
      {
        timestamp_utc: '2026-10-08T16:40:00.000000+00:00',
        reviewer_id: 'qa.lead',
        signature_meaning: 'Reviewed and approved for submission',
      },
    ),
  );
  return {
    [SHA_OPEN]: OPEN_FIELDS.map((seed, i) => extraction(SHA_OPEN, seed, i)),
    [SHA_CERTIFIED]: certified,
  };
}
