import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router';

import { PageHeader } from '@/shared/components/PageHeader';

import { JobHistoryList } from '../components/JobHistoryList';
import { UploadCard } from '../components/UploadCard';
import { describeSubmitError } from '../errorMessages';
import { useSubmitJob } from '../hooks/useSubmitJob';
import { clearJobs, removeJob, useJobHistory } from '../jobHistory';

export function ConvertPage() {
  const navigate = useNavigate();
  const jobs = useJobHistory();
  const submit = useSubmitJob();

  function handleSubmit(file: File) {
    submit.mutate(file, { onSuccess: (job) => navigate(`/convert/jobs/${job.id}`) });
  }

  return (
    <>
      <PageHeader
        title="Convert"
        subtitle="Upload a clinical trial protocol PDF to convert it to CDISC USDM 4.0 JSON."
      />
      <Stack spacing={4}>
        <UploadCard
          onSubmit={handleSubmit}
          submitting={submit.isPending}
          error={submit.isError ? describeSubmitError(submit.error) : undefined}
        />
        <JobHistoryList jobs={jobs} onRemove={removeJob} onClear={clearJobs} />
      </Stack>
    </>
  );
}
