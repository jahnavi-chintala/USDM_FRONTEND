import Button from '@mui/material/Button';
import { Link } from 'react-router';

import { EmptyState } from '@/shared/components/EmptyState';

export function NotFoundPage() {
  return (
    <EmptyState title="Page not found">
      The address does not match any page.{' '}
      <Button component={Link} to="/" size="small">
        Go to Home
      </Button>
    </EmptyState>
  );
}
