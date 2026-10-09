import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { uploadProtocol } from '../api/protocolsApi';
import { uploadStore, useUploadItems } from '../uploads/uploadStore';
import { protocolKeys } from './useProtocols';

/** The current upload batch, with actions that keep the protocol list in step. */
export function useUploads() {
  const queryClient = useQueryClient();
  const items = useUploadItems();
  const refresh = useCallback(
    () => void queryClient.invalidateQueries({ queryKey: protocolKeys.list }),
    [queryClient],
  );

  const start = useCallback(
    (files: File[]) => void uploadStore.start(files, (file) => uploadProtocol(file), refresh),
    [refresh],
  );
  const retry = useCallback(
    (key: string) => void uploadStore.retry(key, (file) => uploadProtocol(file), refresh),
    [refresh],
  );

  return { items, start, retry };
}
