import { useMutation } from '@tanstack/react-query';

import { submitJob } from '../api/convertApi';
import { addJob } from '../jobHistory';

/** Uploads a PDF and records the new job in the browser's job history. */
export function useSubmitJob() {
  return useMutation({
    mutationFn: (file: File) => submitJob(file),
    onSuccess: (job, file) => {
      addJob({
        id: job.id,
        fileName: file.name,
        fileSize: file.size,
        submittedAt: new Date().toISOString(),
        status: job.status,
      });
    },
  });
}
