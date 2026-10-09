import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { updateSettings } from '@/features/settings';
import { renderWithProviders } from '@/test/render';

import type { ReviewProtocol } from '../types';
import { ReviewWorkspace } from './ReviewWorkspace';

const alpha: ReviewProtocol = {
  id: 'alpha-301',
  name: 'ALPHA-301',
  title: 'Phase 3 · Oncology',
  file_name: 'ALPHA-301_protocol_v3.pdf',
  page_count: 142,
  status: 'in_review',
  stored: false,
};

function render(onProtocolChange = vi.fn()) {
  renderWithProviders(<ReviewWorkspace protocol={alpha} onProtocolChange={onProtocolChange} />);
  return onProtocolChange;
}

describe('ReviewWorkspace', () => {
  beforeEach(() => updateSettings({ reviewerId: 'jdoe' }));

  it('opens on the first class to review, with its quotes highlighted on the source page', async () => {
    render();
    const data = await screen.findByRole('region', { name: 'Extracted data' });
    expect(within(data).getByRole('heading', { name: 'Study Design' })).toBeInTheDocument();
    expect(within(data).getByText('Pending review')).toBeInTheDocument();
    const source = screen.getByRole('region', { name: 'Source protocol page' });
    expect(await within(source).findByText('approximately 480 participants')).toHaveProperty(
      'tagName',
      'MARK',
    );
    expect(screen.getByRole('img', { name: 'Overall confidence 82%' })).toBeInTheDocument();
  });

  it('approves a class and moves on to the next one', async () => {
    const onProtocolChange = render();
    const data = await screen.findByRole('region', { name: 'Extracted data' });
    await userEvent.click(within(data).getByRole('button', { name: 'Approve' }));

    expect(await screen.findByRole('heading', { name: 'Arms' })).toBeInTheDocument();
    expect(screen.getByText('3/9 approved')).toBeInTheDocument();
    expect(screen.getByText(/Study Design verified/)).toBeInTheDocument();
    expect(onProtocolChange).toHaveBeenCalled();
  });

  it('needs a reason before saving an edit, and marks the class as edited', async () => {
    render();
    const data = await screen.findByRole('region', { name: 'Extracted data' });
    await userEvent.click(within(data).getByRole('button', { name: 'Edit' }));
    const input = within(data).getByRole('textbox', { name: 'Phase' });
    await userEvent.clear(input);
    await userEvent.type(input, 'Phase 3b');
    expect(within(data).getByRole('button', { name: 'Save changes' })).toBeDisabled();

    await userEvent.type(within(data).getByLabelText(/Reason for change/), 'Amendment 2');
    await userEvent.click(within(data).getByRole('button', { name: 'Save changes' }));
    expect(await within(data).findByText('Edited · needs approval')).toBeInTheDocument();
    expect(within(data).getByText('Phase 3b')).toBeInTheDocument();
  });

  it('flags a low-confidence class and shows the Schedule of Activities', async () => {
    render();
    await userEvent.click(
      await screen.findByRole('button', { name: /Schedule of Activities, pending review/ }),
    );
    const data = screen.getByRole('region', { name: 'Extracted data' });
    expect(within(data).getByText(/Low confidence/)).toBeInTheDocument();
    expect(within(data).getByRole('table', { name: 'Schedule of Activities' })).toBeInTheDocument();
  });

  it('blocks decisions until a reviewer id is set', async () => {
    updateSettings({ reviewerId: '' });
    render();
    const data = await screen.findByRole('region', { name: 'Extracted data' });
    expect(within(data).getByText(/Set your reviewer id/)).toBeInTheDocument();
    expect(within(data).getByRole('button', { name: 'Approve' })).toBeDisabled();
  });

  it('shows the approved banner and stores the output', async () => {
    const onProtocolChange = vi.fn();
    renderWithProviders(
      <ReviewWorkspace
        protocol={{ ...alpha, id: 'omega-33', name: 'OMEGA-33', status: 'approved' }}
        onProtocolChange={onProtocolChange}
      />,
    );
    expect(await screen.findByText('Approved · all 9 classes verified')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Store to database' }));
    await waitFor(() => expect(onProtocolChange).toHaveBeenCalled());
    expect(await screen.findByText(/saved in the repository/)).toBeInTheDocument();
  });
});
