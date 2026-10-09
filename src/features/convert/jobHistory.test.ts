import { addJob, clearJobs, jobHistoryStore, removeJob, updateJobStatus } from './jobHistory';

const job = (id: string) => ({
  id,
  fileName: `${id}.pdf`,
  fileSize: 100,
  submittedAt: '2026-10-09T10:00:00Z',
  status: 'queued' as const,
});

describe('job history', () => {
  beforeEach(() => clearJobs());

  it('adds newest first and persists to localStorage', () => {
    addJob(job('a'));
    addJob(job('b'));
    expect(jobHistoryStore.get().map((j) => j.id)).toEqual(['b', 'a']);
    expect(JSON.parse(window.localStorage.getItem('usdm4.jobs') ?? '[]')).toHaveLength(2);
  });

  it('updates the status and removes a job', () => {
    addJob(job('a'));
    updateJobStatus('a', 'done');
    expect(jobHistoryStore.get()[0]?.status).toBe('done');
    removeJob('a');
    expect(jobHistoryStore.get()).toEqual([]);
  });

  it('keeps at most 50 jobs', () => {
    for (let i = 0; i < 55; i += 1) addJob(job(String(i)));
    expect(jobHistoryStore.get()).toHaveLength(50);
    expect(jobHistoryStore.get()[0]?.id).toBe('54');
  });
});
