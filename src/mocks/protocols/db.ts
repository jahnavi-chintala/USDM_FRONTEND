import {
  PROCESSING_STAGES,
  type FailureReason,
  type FileType,
  type LogEntry,
  type ProcessingStage,
  type ProtocolDetail,
  type ProtocolFailure,
  type ProtocolSummary,
} from '@/features/protocols/types';
import { overallConfidence } from '@/features/usdm-review/confidence';
import type { ClassStatus, SourcePage, UsdmClass } from '@/features/usdm-review/types';

import { CLASS_TEMPLATES, PAGE_FILLER } from './fixtures';

/**
 * In-memory backend for the mock API.
 *
 * Processing advances a step each time a protocol is read, so the screens can be followed
 * by hand: every stage takes three reads. The file name chooses the outcome:
 *   - contains "encrypted" | "scanned" | "corrupt" -> fails while extracting text
 *   - contains "timeout"                          -> fails while mapping to USDM
 *   - contains "invalid"                          -> fails validation, with errors
 *   - anything else                               -> ready for review
 */

interface MockProtocol extends ProtocolDetail {
  classes: UsdmClass[];
  /** Planned outcome of processing, from the file name. */
  outcome: { reason: FailureReason; stage: ProcessingStage } | null;
}

const STEP = 34;
const protocols = new Map<string, MockProtocol>();
let counter = 0;

const now = () => new Date().toISOString();
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

function buildClasses(options: {
  approved?: number;
  shift?: number;
  allApproved?: boolean;
}): UsdmClass[] {
  return CLASS_TEMPLATES.map((template, index) => ({
    id: template.id,
    name: template.name,
    usdm_classes: template.usdm_classes,
    page: template.page,
    model_confidence: Math.max(5, Math.min(99, template.model_confidence + (options.shift ?? 0))),
    status: (options.allApproved || index < (options.approved ?? 0)
      ? 'approved'
      : 'pending') as ClassStatus,
    fields: template.fields.map((field, fieldIndex) => ({
      id: `${template.id}-${fieldIndex}`,
      label: field.label,
      value: field.value,
      quote: field.quote,
      page: template.page,
      quote_located: true,
    })),
    soa: template.soa ?? null,
  }));
}

function summarise(protocol: MockProtocol): void {
  protocol.classes_total = protocol.classes.length;
  protocol.classes_approved = protocol.classes.filter((c) => c.status === 'approved').length;
  protocol.confidence = protocol.classes.length ? overallConfidence(protocol.classes) : null;
  if (protocol.status === 'in_review' && protocol.classes_approved === protocol.classes_total) {
    protocol.status = 'approved';
  }
}

function base(
  fields: Pick<MockProtocol, 'id' | 'name' | 'title' | 'file_name'> & Partial<MockProtocol>,
): MockProtocol {
  const protocol: MockProtocol = {
    file_type: fields.file_name.endsWith('.docx') ? 'docx' : 'pdf',
    page_count: null,
    uploaded_at: now(),
    status: 'processing',
    stage: 'extracting_text',
    stage_progress: 0,
    classes_total: 0,
    classes_approved: 0,
    confidence: null,
    failure: null,
    stored: false,
    log: [],
    classes: [],
    outcome: null,
    ...fields,
  };
  summarise(protocol);
  return protocol;
}

function seed(): void {
  const add = (p: MockProtocol) => protocols.set(p.id, p);
  add(
    base({
      id: 'alpha-301',
      name: 'ALPHA-301',
      title: 'Phase 3 · Oncology · Zelvatinib vs placebo',
      file_name: 'ALPHA-301_protocol_v3.pdf',
      page_count: 142,
      uploaded_at: hoursAgo(1),
      status: 'in_review',
      stage: null,
      stage_progress: null,
      classes: buildClasses({ approved: 2 }),
    }),
  );
  add(
    base({
      id: 'epsilon-5',
      name: 'EPSILON-5',
      title: 'Phase 2 · Neurology',
      file_name: 'EPS-5_amend2.pdf',
      page_count: 96,
      uploaded_at: hoursAgo(20),
      status: 'in_review',
      stage: null,
      stage_progress: null,
      classes: buildClasses({ shift: -4 }),
    }),
  );
  add(
    base({
      id: 'gamma-07',
      name: 'GAMMA-07',
      title: 'Phase 1 · First-in-human',
      file_name: 'GAMMA-07_protocol.pdf',
      page_count: 64,
      uploaded_at: hoursAgo(0.5),
      stage: 'mapping_to_usdm',
      stage_progress: 55,
      log: [
        { at: hoursAgo(0.5), level: 'info', message: 'Upload received · GAMMA-07_protocol.pdf' },
        { at: hoursAgo(0.49), level: 'info', message: 'Pages detected: 64' },
        {
          at: hoursAgo(0.47),
          level: 'success',
          message: 'Text extracted · 1 204 blocks, 9 tables',
        },
        { at: hoursAgo(0.46), level: 'info', message: 'Mapping to USDM 4.0 classes…' },
      ],
    }),
  );
  add(
    base({
      id: 'beta-12',
      name: 'BETA-12',
      title: 'Phase 2 · Cardiology · Dose-ranging',
      file_name: 'BETA-12_CSP_final.docx',
      uploaded_at: hoursAgo(0.6),
      stage: 'extracting_text',
      stage_progress: 20,
      log: [
        { at: hoursAgo(0.6), level: 'info', message: 'Upload received · BETA-12_CSP_final.docx' },
      ],
    }),
  );
  add(
    base({
      id: 'delta-220',
      name: 'DELTA-220',
      title: 'Phase 3 · Respiratory',
      file_name: 'DELTA-220_scan.pdf',
      uploaded_at: hoursAgo(18),
      status: 'failed',
      stage: null,
      stage_progress: null,
      failure: { stage: 'extracting_text', reason: 'scanned_pdf_no_ocr', detail: null, errors: [] },
      outcome: { reason: 'scanned_pdf_no_ocr', stage: 'extracting_text' },
    }),
  );
  const approved = [
    ['kappa-114', 'KAPPA-114', 'Phase 3 · Immunology', 'KAPPA-114.pdf', 24 * 11, true],
    ['lambda-9', 'LAMBDA-9', 'Phase 2 · Dermatology', 'LAMBDA-9_v2.docx', 24 * 12, false],
    ['omega-33', 'OMEGA-33', 'Phase 1b · Oncology', 'OMEGA-33.pdf', 24 * 14, false],
  ] as const;
  approved.forEach(([id, name, title, file, age, stored]) =>
    add(
      base({
        id,
        name,
        title,
        file_name: file,
        page_count: 120,
        uploaded_at: hoursAgo(age),
        status: 'approved',
        stage: null,
        stage_progress: null,
        stored,
        classes: buildClasses({ allApproved: true }),
      }),
    ),
  );
}

function plannedOutcome(fileName: string): MockProtocol['outcome'] {
  const name = fileName.toLowerCase();
  const extracting = (['encrypted', 'scanned', 'corrupt'] as const).find((w) => name.includes(w));
  if (extracting) {
    const reason = (
      { encrypted: 'encrypted_pdf', scanned: 'scanned_pdf_no_ocr', corrupt: 'corrupt_pdf' } as const
    )[extracting];
    return { reason, stage: 'extracting_text' };
  }
  if (name.includes('timeout')) return { reason: 'timeout', stage: 'mapping_to_usdm' };
  if (name.includes('invalid')) return { reason: 'validation_failed', stage: 'validating' };
  return null;
}

function log(protocol: MockProtocol, level: LogEntry['level'], message: string): void {
  protocol.log.push({ at: now(), level, message });
}

function fail(protocol: MockProtocol, reason: FailureReason, stage: ProcessingStage): void {
  const failure: ProtocolFailure =
    reason === 'validation_failed'
      ? {
          stage,
          reason,
          detail: '3 blocking errors.',
          errors: [
            'StudyDesign: no arms are linked to an epoch.',
            'Endpoint "PFS" has no objective.',
            'ScheduleTimeline: visit "W8" has no timing.',
          ],
        }
      : { stage, reason, detail: null, errors: [] };
  Object.assign(protocol, { status: 'failed', stage: null, stage_progress: null, failure });
  log(protocol, 'error', `Stopped: ${reason}`);
}

const STAGE_DONE: Record<ProcessingStage, string> = {
  extracting_text: 'Text extracted · 1 204 blocks, 9 tables',
  mapping_to_usdm: 'Mapped 9 classes · 141/152 values grounded to verbatim quotes',
  validating: '2 low-confidence classes flagged for review',
};

/** One step of the simulated pipeline. */
function advance(protocol: MockProtocol): void {
  if (protocol.status !== 'processing' || !protocol.stage) return;
  const stage = protocol.stage;
  if (protocol.outcome?.stage === stage && (protocol.stage_progress ?? 0) >= STEP) {
    fail(protocol, protocol.outcome.reason, stage);
    return;
  }
  const progress = (protocol.stage_progress ?? 0) + STEP;
  if (progress < 100) {
    protocol.stage_progress = progress;
    return;
  }
  log(protocol, stage === 'validating' ? 'warning' : 'success', STAGE_DONE[stage]);
  if (stage === 'extracting_text') protocol.page_count ??= 72;
  const next = PROCESSING_STAGES[PROCESSING_STAGES.indexOf(stage) + 1];
  if (next) {
    protocol.stage = next;
    protocol.stage_progress = 0;
    log(
      protocol,
      'info',
      next === 'mapping_to_usdm'
        ? 'Mapping to USDM 4.0 classes…'
        : 'Validating against USDM schema and CDISC rules…',
    );
    return;
  }
  Object.assign(protocol, { status: 'in_review', stage: null, stage_progress: null });
  protocol.classes = buildClasses({});
  summarise(protocol);
}

function summary(protocol: MockProtocol): ProtocolSummary {
  // Leave out the mock-only and detail-only fields.
  const copy: Partial<MockProtocol> = { ...protocol };
  delete copy.log;
  delete copy.classes;
  delete copy.outcome;
  return copy as ProtocolSummary;
}

function detail(protocol: MockProtocol): ProtocolDetail {
  return { ...summary(protocol), log: [...protocol.log] };
}

// ---- API ------------------------------------------------------------------------------------

export function resetProtocolDb(): void {
  protocols.clear();
  counter = 0;
  seed();
}

export function listProtocols(): ProtocolSummary[] {
  protocols.forEach(advance);
  return [...protocols.values()].map(summary);
}

export function getProtocol(id: string): ProtocolDetail | null {
  const protocol = protocols.get(id);
  if (!protocol) return null;
  advance(protocol);
  return detail(protocol);
}

export function createProtocol(fileName: string, fileType: FileType): ProtocolSummary {
  counter += 1;
  const stem = fileName.replace(/\.[^.]+$/, '');
  const name = (stem.split('_')[0] || stem).toUpperCase();
  const protocol = base({
    id: `upload-${counter}`,
    name,
    title: 'Study details appear once mapping has finished',
    file_name: fileName,
    file_type: fileType,
    outcome: plannedOutcome(fileName),
  });
  log(protocol, 'info', `Upload received · ${fileName}`);
  log(protocol, 'info', 'Extracting text and layout…');
  protocols.set(protocol.id, protocol);
  return summary(protocol);
}

/** Restarts processing; the planned failure is dropped, as if the problem had been fixed. */
export function restartProtocol(id: string): ProtocolSummary | null {
  const protocol = protocols.get(id);
  if (!protocol) return null;
  Object.assign(protocol, {
    status: 'processing',
    stage: 'extracting_text',
    stage_progress: 0,
    failure: null,
    outcome: null,
    classes: [],
    stored: false,
    log: [],
  });
  summarise(protocol);
  log(protocol, 'info', 'Processing restarted · extracting text and layout…');
  return summary(protocol);
}

export function getClasses(id: string): UsdmClass[] | null {
  const protocol = protocols.get(id);
  if (!protocol) return null;
  // A class being extracted again finishes on the next read.
  protocol.classes = protocol.classes.map((c) =>
    c.status === 'reextracting'
      ? { ...c, status: 'pending', model_confidence: Math.min(98, c.model_confidence + 6) }
      : c,
  );
  summarise(protocol);
  return protocol.classes;
}

export type ClassChange =
  { kind: 'approve' | 'reject' | 'reextract' } | { kind: 'edit'; values: Record<string, string> };

export function changeClass(id: string, classId: string, change: ClassChange): UsdmClass | null {
  const protocol = protocols.get(id);
  const target = protocol?.classes.find((c) => c.id === classId);
  if (!protocol || !target) return null;
  const status: Record<ClassChange['kind'], ClassStatus> = {
    approve: 'approved',
    reject: 'rejected',
    reextract: 'reextracting',
    edit: 'edited',
  };
  const updated: UsdmClass = {
    ...target,
    status: status[change.kind],
    fields:
      change.kind === 'edit'
        ? target.fields.map((f) =>
            f.id in change.values ? { ...f, value: change.values[f.id]! } : f,
          )
        : target.fields,
  };
  protocol.classes = protocol.classes.map((c) => (c.id === classId ? updated : c));
  summarise(protocol);
  return updated;
}

export function storeProtocol(id: string): ProtocolSummary | null {
  const protocol = protocols.get(id);
  if (!protocol) return null;
  protocol.stored = true;
  return summary(protocol);
}

export function usdmDocument(id: string): unknown {
  const protocol = protocols.get(id);
  if (!protocol) return null;
  return {
    usdmVersion: '4.0.0',
    systemName: 'iDigitise Protocol (mock)',
    study: {
      name: protocol.name,
      versions: [
        {
          titles: [{ text: protocol.title }],
          classes: Object.fromEntries(
            protocol.classes.map((c) => [
              c.usdm_classes.join('+'),
              Object.fromEntries(c.fields.map((f) => [f.label, f.value])),
            ]),
          ),
        },
      ],
    },
  };
}

/** The text of a source page; the quotes of every class on that page appear in it verbatim. */
export function sourcePage(id: string, page: number): SourcePage | null {
  const protocol = protocols.get(id);
  if (!protocol) return null;
  const onPage = CLASS_TEMPLATES.filter((c) => c.page === page);
  const paragraphs = [PAGE_FILLER.opening];
  onPage.forEach((c) =>
    c.fields.forEach((field, index) =>
      paragraphs.push(
        index % 2
          ? `As set out in this section, ${field.quote} applies throughout the study.`
          : `${field.quote} is described here and applies to all participants enrolled in the study.`,
      ),
    ),
  );
  paragraphs.push(PAGE_FILLER.closing);
  return {
    page,
    page_count: protocol.page_count ?? page,
    heading: onPage.map((c) => c.name).join(' · ') || null,
    paragraphs,
  };
}

resetProtocolDb();
