import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { JsonTree } from './JsonTree';

describe('JsonTree', () => {
  const data = { study: { name: 'ZV-210', arms: ['A', 'B'], blinded: true } };

  it('shows the first levels and expands on click', async () => {
    render(<JsonTree data={data} initialDepth={2} />);
    expect(screen.getByText('"ZV-210"')).toBeInTheDocument();
    expect(screen.queryByText('"A"')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /arms/ }));
    expect(screen.getByText('"A"')).toBeInTheDocument();
    expect(screen.getByText('true')).toBeInTheDocument();
  });

  it('collapses an open node', async () => {
    render(<JsonTree data={data} initialDepth={2} />);
    const study = screen.getByRole('button', { name: /study/ });
    expect(study).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(study);
    expect(screen.queryByText('"ZV-210"')).not.toBeInTheDocument();
  });
});
