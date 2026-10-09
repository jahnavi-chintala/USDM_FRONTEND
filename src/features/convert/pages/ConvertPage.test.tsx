import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { config } from '@/config/env';
import { server } from '@/mocks/server';
import { renderWithProviders } from '@/test/render';

import { addJob, clearJobs, jobHistoryStore } from '../jobHistory';
import { ConvertPage } from './ConvertPage';

const pdf = (name = 'protocol.pdf') =>
  new File(['%PDF-1.7 test'], name, { type: 'application/pdf' });

describe('ConvertPage', () => {
  beforeEach(() => clearJobs());

  it('uploads a PDF, records the job and opens the job page', async () => {
    renderWithProviders(<ConvertPage />, { route: '/convert', path: '/convert' });

    await userEvent.upload(screen.getByLabelText('Protocol PDF'), pdf());
    await userEvent.click(screen.getByRole('button', { name: 'Convert' }));

    expect(await screen.findByText('other page')).toBeInTheDocument();
    expect(jobHistoryStore.get()[0]).toMatchObject({ fileName: 'protocol.pdf', status: 'queued' });
  });

  it('refuses a file that is not a PDF before uploading', async () => {
    renderWithProviders(<ConvertPage />);
    const notPdf = new File(['x'], 'notes.txt', { type: 'text/plain' });
    await userEvent.upload(screen.getByLabelText('Protocol PDF'), notPdf, { applyAccept: false });
    expect(screen.getByText('Only PDF files can be converted.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Convert' })).not.toBeInTheDocument();
  });

  it('explains a missing API key', async () => {
    server.use(
      http.post(`${config.convertApiUrl}/v1/jobs`, () =>
        HttpResponse.json({ detail: 'Missing or invalid X-API-Key.' }, { status: 401 }),
      ),
    );
    renderWithProviders(<ConvertPage />);
    await userEvent.upload(screen.getByLabelText('Protocol PDF'), pdf());
    await userEvent.click(screen.getByRole('button', { name: 'Convert' }));
    expect(await screen.findByText('API key required')).toBeInTheDocument();
  });

  it('lists previous conversions and removes one', async () => {
    addJob({
      id: 'j1',
      fileName: 'old.pdf',
      fileSize: 2048,
      submittedAt: '2026-10-09T10:00:00Z',
      status: 'done',
    });
    renderWithProviders(<ConvertPage />);
    const table = screen.getByRole('table', { name: 'My conversions' });
    expect(within(table).getByRole('link', { name: 'old.pdf' })).toHaveAttribute(
      'href',
      '/convert/jobs/j1',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Remove old.pdf from list' }));
    expect(screen.getByText('No conversions yet')).toBeInTheDocument();
  });
});
