import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorAlert } from '@/shared/components/ErrorAlert';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader';

import { SourcesTable } from '../components/SourcesTable';
import { useSources } from '../hooks/useReview';

export function ReviewSourcesPage() {
  const sources = useSources();
  const count = sources.data?.length;

  return (
    <>
      <PageHeader
        title="Review"
        subtitle={
          count === undefined
            ? 'Source PDFs with audit history.'
            : `${count} source PDF${count === 1 ? '' : 's'} with audit history.`
        }
      />
      {sources.isPending && <LoadingState label="Loading sources…" />}
      {sources.isError && (
        <ErrorAlert
          error={sources.error}
          title="Cannot load the sources"
          onRetry={() => sources.refetch()}
        />
      )}
      {sources.data?.length === 0 && (
        <EmptyState title="No runs found">
          Convert a protocol first: every run writes its field decisions here.
        </EmptyState>
      )}
      {!!sources.data?.length && <SourcesTable sources={sources.data} />}
    </>
  );
}
