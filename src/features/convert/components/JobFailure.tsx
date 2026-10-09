import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { describeJobFailure } from '../errorMessages';
import type { JobError } from '../types';

interface JobFailureProps {
  error?: JobError;
  httpStatus?: number;
}

export function JobFailure({ error, httpStatus }: JobFailureProps) {
  const { title, message } = describeJobFailure(error, httpStatus);
  const assemblerErrors = error?.assembler_errors ?? [];
  return (
    <Alert severity="error">
      <AlertTitle>{title}</AlertTitle>
      {message}
      {assemblerErrors.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Assembler errors
          </Typography>
          <Box component="ul" sx={{ my: 0.5, pl: 2.5 }}>
            {assemblerErrors.map((item, index) => (
              <li key={index}>
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                  {typeof item === 'string' ? item : JSON.stringify(item)}
                </Typography>
              </li>
            ))}
          </Box>
        </Box>
      )}
    </Alert>
  );
}
