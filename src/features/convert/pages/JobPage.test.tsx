import { screen } from '@testing-library/react';

import { seedConvertJob } from '@/mocks/convert/handlers';
import { renderWithProviders } from '@/test/render';

import { addJob, clearJobs, jobHistoryStore } from '../jobHistory';
import { JobPage } from './JobPage';

function renderJob(id: string) {
  return renderWithProviders(<JobPage />, {
    route: `/convert/jobs/${id}`,
    path: '/convert/jobs/:jobId',
  });
}

describe('JobPage', () => {
  beforeEach(() => clearJobs());

  it('shows the result and download buttons for a finished job', async () => {
    seedConvertJob('ok1', 'protocol.pdf');
    addJob({
      id: 'ok1',
      fileName: 'protocol.pdf',
      fileSize: 1,
      submittedAt: '2026-10-09T10:00:00Z',
      status: 'running',
    });
    renderJob('ok1');

    expect(await screen.findByText(/The USDM document is ready/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download USDM JSON' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'protocol.pdf' })).toBeInTheDocument();
    expect(jobHistoryStore.get()[0]?.status).toBe('done');
  });

  it('shows progress while the job runs', async () => {
    seedConvertJob('r1', 'protocol.pdf', 'running');
    renderJob('r1');
    expect(await screen.findByText('Converting…')).toBeInTheDocument();
  });

  it('explains a document the backend refused', async () => {
    seedConvertJob('f1', 'encrypted.pdf', 'failed');
    renderJob('f1');
    expect(await screen.findByText('The PDF is password-protected')).toBeInTheDocument();
  });

  it('lists assembler errors', async () => {
    seedConvertJob('f2', 'unassemblable.pdf', 'failed');
    renderJob('f2');
    expect(await screen.findByText('Study.name is empty')).toBeInTheDocument();
  });

  it('marks a job the server no longer knows as expired', async () => {
    addJob({
      id: 'gone',
      fileName: 'old.pdf',
      fileSize: 1,
      submittedAt: '2026-10-09T10:00:00Z',
      status: 'done',
    });
    renderJob('gone');
    expect(
      await screen.findByText('This conversion is no longer on the server'),
    ).toBeInTheDocument();
    expect(jobHistoryStore.get()[0]?.status).toBe('expired');
  });
});
