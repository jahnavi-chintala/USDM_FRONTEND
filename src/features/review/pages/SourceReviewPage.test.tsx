import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { settingsStore } from '@/features/settings';
import { SHA_CERTIFIED, SHA_OPEN } from '@/mocks/review/fixtures';
import { renderWithProviders } from '@/test/render';

import { SourceReviewPage } from './SourceReviewPage';

function renderSource(sha: string) {
  return renderWithProviders(<SourceReviewPage />, {
    route: `/review/${sha}`,
    path: '/review/:sha',
  });
}

describe('SourceReviewPage', () => {
  beforeEach(() => settingsStore.set({ apiKey: '', reviewerId: 'jdoe' }));

  it('shows fields worst-first with their decision and confidence', async () => {
    renderSource(SHA_OPEN);
    const table = await screen.findByRole('table', { name: 'Fields' });
    const fields = within(table)
      .getAllByRole('row')
      .slice(1)
      .map((row) => row.querySelector('td:nth-child(2)')?.textContent)
      .filter(Boolean);
    expect(fields.slice(0, 3)).toEqual(['sponsor_address', 'intercurrent_event', 'arm_count']);
    expect(
      screen.getByRole('heading', { name: 'data/protocols/ZV-210-201_amendment2.pdf' }),
    ).toBeInTheDocument();
  });

  it('shows the source crop and the history of a field', async () => {
    renderSource(SHA_OPEN);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Source for design.arm_count' }),
    );
    // jsdom never loads images, so the image stays hidden behind its placeholder: query by alt text.
    expect(await screen.findByAltText('Source crop, page 12')).toHaveAttribute(
      'src',
      expect.stringContaining(`/api/review/sources/${SHA_OPEN}/crop?page=12`),
    );

    await userEvent.click(screen.getByRole('button', { name: 'History for design.arm_count' }));
    const history = await screen.findByRole('list', { name: 'History of design.arm_count' });
    expect(within(history).getByText('extraction')).toBeInTheDocument();
  });

  it('saves an edit with a reason, updates the row and remembers the reviewer', async () => {
    renderSource(SHA_OPEN);
    await userEvent.click(await screen.findByRole('button', { name: 'Edit for design.arm_count' }));

    const form = screen.getByRole('form', { name: 'Edit design.arm_count' });
    expect(within(form).getByLabelText(/Reviewer id/)).toHaveValue('jdoe');
    await userEvent.clear(within(form).getByLabelText(/Value/));
    await userEvent.type(within(form).getByLabelText(/Value/), '3');
    await userEvent.type(
      within(form).getByLabelText(/Reason for change/),
      'Table 2 lists three arms',
    );
    await userEvent.clear(within(form).getByLabelText(/Reviewer id/));
    await userEvent.type(within(form).getByLabelText(/Reviewer id/), 'asmith');
    await userEvent.click(within(form).getByRole('button', { name: 'Save' }));

    const row = await screen.findByTestId('row-design-arm_count');
    await within(row).findByText('3');
    expect(within(row).getByText('Auto-accept')).toBeInTheDocument();
    expect(within(row).getByText('1.00')).toBeInTheDocument();
    expect(settingsStore.get().reviewerId).toBe('asmith');

    await userEvent.click(
      within(row).getByRole('button', { name: 'History for design.arm_count' }),
    );
    expect(await screen.findByText(/was: 2/)).toBeInTheDocument();
  });

  it('certifies the run and reports the post-edit distance', async () => {
    renderSource(SHA_OPEN);
    const form = await screen.findByRole('form', { name: 'Certify this run' });
    expect(within(form).getByLabelText(/Signature meaning/)).toHaveValue(
      'Reviewed and approved for submission',
    );
    await userEvent.click(within(form).getByRole('button', { name: 'Certify this run' }));

    expect(await screen.findByText(/By jdoe at/)).toBeInTheDocument();
    expect(screen.getByText(/0 of 11 field\(s\) edited before certification/)).toBeInTheDocument();
  });

  it('shows an already certified source as certified', async () => {
    renderSource(SHA_CERTIFIED);
    expect(await screen.findByText('Certified.')).toBeInTheDocument();
    expect(screen.queryByRole('form', { name: 'Certify this run' })).not.toBeInTheDocument();
  });

  it('says when a source does not exist', async () => {
    renderSource('unknown');
    expect(await screen.findByText('Source not found')).toBeInTheDocument();
  });
});
