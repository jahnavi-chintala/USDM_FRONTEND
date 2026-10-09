import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { config } from '@/config/env';
import { resetProtocolDb } from '@/mocks/protocols/db';
import { server } from '@/mocks/server';
import { renderWithProviders } from '@/test/render';

import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('starts empty and invites an upload', async () => {
    resetProtocolDb();
    renderWithProviders(<HomePage />);
    expect(
      await screen.findByText('No protocols in progress. Upload one to start.'),
    ).toBeInTheDocument();
    const counts = screen.getByLabelText('Protocol counts');
    expect(within(counts).getByText('Processing').parentElement).toHaveTextContent('Processing0');
  });

  it('shows the counts and the protocols in progress, newest first', async () => {
    renderWithProviders(<HomePage />);

    expect(await screen.findByRole('link', { name: /ALPHA-301/ })).toHaveAttribute(
      'href',
      '/protocols/alpha-301',
    );
    expect(screen.getByRole('link', { name: /DELTA-220.*Failed/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /KAPPA-114/ })).not.toBeInTheDocument();

    const counts = screen.getByLabelText('Protocol counts');
    expect(within(counts).getByText('Ready for review').parentElement).toHaveTextContent(
      'Ready for review2',
    );
    expect(within(counts).getByText('Approved').parentElement).toHaveTextContent('Approved3');
  });

  it('lists the approved protocols on their own tab', async () => {
    renderWithProviders(<HomePage />);
    await userEvent.click(await screen.findByRole('tab', { name: /Approved/ }));
    expect(screen.getByRole('link', { name: /KAPPA-114/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /ALPHA-301/ })).not.toBeInTheDocument();
  });

  it('says when nothing matches the search', async () => {
    renderWithProviders(<HomePage />);
    await userEvent.type(await screen.findByLabelText('Search protocols'), 'zzz');
    expect(screen.getByText('No protocols match your search.')).toBeInTheDocument();
  });

  it('explains a failure to load and offers a retry', async () => {
    server.use(
      http.get(`${config.apiUrl}/api/protocols`, () =>
        HttpResponse.json({ detail: 'Database offline' }, { status: 500 }),
      ),
    );
    renderWithProviders(<HomePage />);
    expect(await screen.findByText('Protocols could not be loaded')).toBeInTheDocument();
    expect(screen.getByText('Database offline')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('refuses a file of the wrong type without uploading it', async () => {
    renderWithProviders(<HomePage />);
    await userEvent.upload(
      await screen.findByLabelText('Protocol files'),
      new File(['x'], 'notes.txt', { type: 'text/plain' }),
      { applyAccept: false },
    );
    expect(screen.getByText('notes.txt is not a PDF or Word (.docx) file.')).toBeInTheDocument();
  });
});
