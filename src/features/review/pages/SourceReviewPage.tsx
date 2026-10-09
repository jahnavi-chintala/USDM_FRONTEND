import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Link, useParams } from 'react-router';

import { isApiError } from '@/shared/api/ApiError';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorAlert } from '@/shared/components/ErrorAlert';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader';

import { CertifyPanel } from '../components/CertifyPanel';
import { FieldsTable } from '../components/FieldsTable';
import { useSource } from '../hooks/useReview';
import { sourceLabel } from '../sourceLabel';

export function SourceReviewPage() {
  const { sha = '' } = useParams();
  const source = useSource(sha);

  const back = (
    <Button component={Link} to="/review" startIcon={<ArrowBackIcon />}>
      All sources
    </Button>
  );

  if (source.isPending) return <LoadingState label="Loading fields…" />;
  if (source.isError) {
    return (
      <>
        <PageHeader title="Review" actions={back} />
        {isApiError(source.error) && source.error.status === 404 ? (
          <EmptyState title="Source not found">
            There are no audit records for this source.
          </EmptyState>
        ) : (
          <ErrorAlert
            error={source.error}
            title="Cannot load this source"
            onRetry={() => source.refetch()}
          />
        )}
      </>
    );
  }

  const { summary, fields } = source.data;
  return (
    <>
      <PageHeader
        title={sourceLabel(summary)}
        subtitle={`sha256 ${summary.source_sha256} · ${summary.n_fields} fields · ${summary.run_ids.length} run(s)`}
        actions={back}
      />
      <Stack spacing={3}>
        <CertifyPanel sha={sha} certified={summary.certified} />
        <FieldsTable sha={sha} rows={fields} />
      </Stack>
    </>
  );
}
