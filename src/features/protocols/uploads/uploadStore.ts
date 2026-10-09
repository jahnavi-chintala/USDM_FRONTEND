import { useSyncExternalStore } from 'react';

import { describeUploadError, type ErrorDescription } from '../errorMessages';
import { fileTypeOf } from '../fileRules';
import type { FileType, ProtocolSummary } from '../types';

export type UploadState = 'uploading' | 'uploaded' | 'failed';

export interface UploadItem {
  key: string;
  file: File;
  fileType: FileType;
  state: UploadState;
  error: ErrorDescription | null;
  protocolId: string | null;
}

type Uploader = (file: File) => Promise<ProtocolSummary>;

/**
 * The files of the latest upload, each tracked on its own: one failing or slowing down does
 * not block the others. Kept in memory only; once uploaded, a file is a protocol on Home.
 */
export function createUploadStore() {
  let items: UploadItem[] = [];
  let counter = 0;
  const listeners = new Set<() => void>();

  const emit = () => listeners.forEach((listener) => listener());
  const update = (key: string, changes: Partial<UploadItem>) => {
    items = items.map((item) => (item.key === key ? { ...item, ...changes } : item));
    emit();
  };

  async function run(item: UploadItem, upload: Uploader, onUploaded: () => void) {
    update(item.key, { state: 'uploading', error: null });
    try {
      const protocol = await upload(item.file);
      update(item.key, { state: 'uploaded', protocolId: protocol.id });
      onUploaded();
    } catch (error) {
      update(item.key, { state: 'failed', error: describeUploadError(error) });
    }
  }

  return {
    get: () => items,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    /** Starts a new batch; the previous one is cleared. Files must already be checked. */
    start(files: File[], upload: Uploader, onUploaded: () => void): Promise<void[]> {
      const batch: UploadItem[] = files.map((file) => ({
        key: `upload-${(counter += 1)}`,
        file,
        fileType: fileTypeOf(file) ?? 'pdf',
        state: 'uploading',
        error: null,
        protocolId: null,
      }));
      items = batch;
      emit();
      return Promise.all(batch.map((item) => run(item, upload, onUploaded)));
    },
    retry(key: string, upload: Uploader, onUploaded: () => void): Promise<void> {
      const item = items.find((candidate) => candidate.key === key);
      return item ? run(item, upload, onUploaded) : Promise.resolve();
    },
    clear() {
      items = [];
      emit();
    },
  };
}

export const uploadStore = createUploadStore();

export function useUploadItems(): UploadItem[] {
  return useSyncExternalStore(uploadStore.subscribe, uploadStore.get, uploadStore.get);
}
