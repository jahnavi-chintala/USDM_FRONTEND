import { delay, http, HttpResponse } from 'msw';

import { config } from '@/config/env';
import type { JobStatus, JobStatusResponse } from '@/features/convert/types';

import { sampleReport, sampleUsdm } from './fixtures';

/**
 * Mock of the conversion API's async jobs (`/v1/jobs`).
 *
 * A job is `queued` on the first poll, `running` on the next one and finished after that.
 * The uploaded file name chooses the outcome, so every screen can be tried by hand:
 *   - contains "encrypted"     -> fails with reason encrypted_pdf
 *   - contains "scanned"       -> fails with reason scanned_pdf_no_ocr
 *   - contains "corrupt"       -> fails with reason corrupt_pdf
 *   - contains "unassemblable" -> fails with assembler errors
 *   - contains "timeout"       -> fails with 504
 *   - anything else            -> done
 * A file without the %PDF- header is refused with 400, like the real service.
 */

interface MockJob {
  fileName: string;
  polls: number;
}

const jobs = new Map<string, MockJob>();
const base = `${config.convertApiUrl}/v1/jobs`;

export function resetConvertMocks(): void {
  jobs.clear();
}

/** Test helper: registers a job whose next poll returns `queued`, `running` or the final state. */
export function seedConvertJob(id: string, fileName: string, next: JobStatus = 'done'): void {
  const polls = { queued: 0, running: 1, done: 2, failed: 2 }[next];
  jobs.set(id, { fileName, polls });
}

function failure(fileName: string): Omit<JobStatusResponse, 'id'> | null {
  const name = fileName.toLowerCase();
  const reasons = ['encrypted', 'scanned', 'corrupt'] as const;
  const reasonCode = {
    encrypted: 'encrypted_pdf',
    scanned: 'scanned_pdf_no_ocr',
    corrupt: 'corrupt_pdf',
  } as const;
  const match = reasons.find((r) => name.includes(r));
  if (match) {
    return {
      status: 'failed',
      http_status: 422,
      error: { detail: 'The document cannot be converted.', reason: reasonCode[match] },
    };
  }
  if (name.includes('unassemblable')) {
    return {
      status: 'failed',
      http_status: 422,
      error: {
        detail: 'The protocol could not be assembled into a USDM document.',
        assembler_errors: ['StudyDesign: at least one arm is required', 'Study.name is empty'],
      },
    };
  }
  if (name.includes('timeout')) {
    return { status: 'failed', http_status: 504, error: { detail: 'Conversion exceeded 900 s.' } };
  }
  return null;
}

export const convertHandlers = [
  http.post(base, async ({ request }) => {
    await delay(200);
    const form = await request.formData();
    const file = form.get('file');
    // Checked by shape, not `instanceof File`: in Node tests the File class differs from jsdom's.
    if (!file || typeof file === 'string' || file.size === 0) {
      return HttpResponse.json({ detail: 'The upload is empty.' }, { status: 400 });
    }
    // Like the backend, check the content (%PDF- header), not the file name.
    if ((await file.slice(0, 5).text()) !== '%PDF-') {
      return HttpResponse.json({ detail: 'The upload is not a PDF file.' }, { status: 400 });
    }
    const id = crypto.randomUUID().replace(/-/g, '');
    jobs.set(id, { fileName: file.name, polls: 0 });
    return HttpResponse.json({ id, status: 'queued', poll: `/v1/jobs/${id}` }, { status: 202 });
  }),

  http.get(`${base}/:jobId`, async ({ params }) => {
    await delay(150);
    const id = String(params.jobId);
    const job = jobs.get(id);
    if (!job) {
      return HttpResponse.json({ detail: 'Unknown or expired job id.' }, { status: 404 });
    }
    job.polls += 1;
    const phase: JobStatus = job.polls === 1 ? 'queued' : job.polls === 2 ? 'running' : 'done';
    if (phase !== 'done') return HttpResponse.json({ id, status: phase });

    const failed = failure(job.fileName);
    if (failed) return HttpResponse.json({ id, ...failed });
    const runId = `run-${id.slice(0, 8)}`;
    return HttpResponse.json({
      id,
      status: 'done',
      run_id: runId,
      result: { usdm: sampleUsdm, report: sampleReport(runId) },
    });
  }),
];
