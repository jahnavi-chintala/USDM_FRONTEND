import { ApiError } from '@/shared/api/ApiError';

import type { ProtocolSummary } from '../types';
import { createUploadStore } from './uploadStore';

const pdf = (name: string) => new File(['%PDF'], name, { type: 'application/pdf' });

describe('upload store', () => {
  it('tracks each file on its own and allows a retry of the failed one', async () => {
    const store = createUploadStore();
    const onUploaded = vi.fn();
    let refuse = true;
    const upload = vi.fn(async (file: File) => {
      if (file.name === 'b.pdf' && refuse) throw new ApiError(413, 'too large');
      return { id: `id-${file.name}` } as ProtocolSummary;
    });

    const running = store.start([pdf('a.pdf'), pdf('b.pdf')], upload, onUploaded);
    expect(store.get().map((item) => item.state)).toEqual(['uploading', 'uploading']);
    await running;

    const [a, b] = store.get();
    expect(a).toMatchObject({ state: 'uploaded', protocolId: 'id-a.pdf' });
    expect(b?.state).toBe('failed');
    expect(b?.error?.title).toBe('File is over 60 MB');
    expect(onUploaded).toHaveBeenCalledTimes(1);

    refuse = false;
    await store.retry(b!.key, upload, onUploaded);
    expect(store.get()[1]).toMatchObject({ state: 'uploaded', error: null });
    expect(onUploaded).toHaveBeenCalledTimes(2);
  });

  it('replaces the previous batch when a new upload starts', async () => {
    const store = createUploadStore();
    const upload = async () => ({ id: 'x' }) as ProtocolSummary;
    await store.start([pdf('a.pdf')], upload, () => {});
    await store.start([pdf('c.pdf'), pdf('d.pdf')], upload, () => {});
    expect(store.get().map((item) => item.file.name)).toEqual(['c.pdf', 'd.pdf']);
  });
});
