import Button from '@mui/material/Button';
import { Link } from 'react-router';

import { EmptyState } from '@/shared/components/EmptyState';

export function NotFoundPage() {
  return (
    <EmptyState title="Page not found">
      The address does not match any page.{' '}
      <Button component={Link} to="/convert" size="small">
        Go to Convert
      </Button>
    </EmptyState>
  );
}
