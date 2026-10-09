import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { config } from '@/config/env';
import { SHA_CERTIFIED, SHA_OPEN } from '@/mocks/review/fixtures';
import { server } from '@/mocks/server';
import { renderWithProviders } from '@/test/render';

import { ReviewSourcesPage } from './ReviewSourcesPage';

const sourcesUrl = `${config.reviewApiUrl}/api/review/sources`;

describe('ReviewSourcesPage', () => {
  it('lists every source with its counts and certification status', async () => {
    renderWithProviders(<ReviewSourcesPage />);

    const table = await screen.findByRole('table', { name: 'Sources' });
    expect(screen.getByText('2 source PDFs with audit history.')).toBeInTheDocument();
    const open = within(table).getByRole('link', { name: /ZV-210-201/ });
    expect(open).toHaveAttribute('href', `/review/${SHA_OPEN}`);
    expect(within(table).getByRole('link', { name: /ZK-415-102/ })).toHaveAttribute(
      'href',
      `/review/${SHA_CERTIFIED}`,
    );
    expect(within(table).getByText('certified')).toBeInTheDocument();
    expect(within(table).getByText('not certified')).toBeInTheDocument();
  });

  it('explains what to do when there are no runs', async () => {
    server.use(http.get(sourcesUrl, () => HttpResponse.json([])));
    renderWithProviders(<ReviewSourcesPage />);
    expect(await screen.findByText('No runs found')).toBeInTheDocument();
  });

  it('shows an error with a retry when the review API is unreachable', async () => {
    server.use(http.get(sourcesUrl, () => HttpResponse.error()));
    renderWithProviders(<ReviewSourcesPage />);
    expect(await screen.findByText('Cannot load the sources')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
