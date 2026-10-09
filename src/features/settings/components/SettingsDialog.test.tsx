import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render';

import { settingsStore } from '../settingsStore';
import { SettingsDialog } from './SettingsDialog';

describe('SettingsDialog', () => {
  beforeEach(() => settingsStore.set({ apiKey: '', reviewerId: '' }));

  it('saves the API key and reviewer id for the session', async () => {
    const onClose = vi.fn();
    renderWithProviders(<SettingsDialog open onClose={onClose} />);

    await userEvent.type(screen.getByLabelText('API key'), ' secret-key ');
    await userEvent.type(screen.getByLabelText('Reviewer id'), 'jdoe');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(settingsStore.get()).toEqual({ apiKey: 'secret-key', reviewerId: 'jdoe' });
    expect(JSON.parse(window.sessionStorage.getItem('usdm4.settings') ?? '{}')).toMatchObject({
      reviewerId: 'jdoe',
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('discards changes on cancel', async () => {
    settingsStore.set({ apiKey: 'kept', reviewerId: 'kept' });
    renderWithProviders(<SettingsDialog open onClose={() => {}} />);

    await userEvent.clear(screen.getByLabelText('Reviewer id'));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(settingsStore.get().reviewerId).toBe('kept');
  });
});
