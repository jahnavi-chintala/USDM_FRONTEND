import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useRouteError } from 'react-router';

import { ErrorAlert } from '@/shared/components/ErrorAlert';

/** Shown when a page throws while rendering, instead of a blank screen. */
export function RouteErrorPage() {
  const error = useRouteError();
  return (
    <Box sx={{ p: 4, maxWidth: 720, mx: 'auto' }}>
      <ErrorAlert error={error} title="This page failed to load" />
      <Button sx={{ mt: 2 }} variant="outlined" onClick={() => window.location.assign('/')}>
        Back to start
      </Button>
    </Box>
  );
}
