import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render';

import { ProtocolPage } from './ProtocolPage';

const render = (id: string) =>
  renderWithProviders(<ProtocolPage />, {
    route: `/protocols/${id}`,
    path: '/protocols/:protocolId',
  });

describe('ProtocolPage', () => {
  it('shows the stages and the log while processing', async () => {
    render('beta-12');
    expect(await screen.findByRole('heading', { name: 'Processing' })).toBeInTheDocument();
    const steps = screen
      .getAllByRole('listitem')
      .filter((item) => item.hasAttribute('aria-current'));
    expect(steps).toHaveLength(1);
    expect(screen.getByLabelText('Processing log')).toHaveTextContent('Upload received');
  });

  it('explains a failure and restarts processing on retry', async () => {
    render('delta-220');
    expect(
      await screen.findByRole('heading', { name: 'Scanned document — no text layer' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Upload a text-based version/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Retry processing' }));
    expect(await screen.findByRole('heading', { name: 'Processing' })).toBeInTheDocument();
  });

  it('opens the review once the protocol is ready', async () => {
    render('alpha-301');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Review ALPHA-301' }),
    ).toBeInTheDocument();
  });

  it('says when the protocol does not exist', async () => {
    render('nope');
    expect(await screen.findByText('Protocol not found')).toBeInTheDocument();
  });
});
