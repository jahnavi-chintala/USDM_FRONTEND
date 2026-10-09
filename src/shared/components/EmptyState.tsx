import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  children?: ReactNode;
}

export function EmptyState({ title, children }: EmptyStateProps) {
  return (
    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h6" component="p">
        {title}
      </Typography>
      {children && (
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {children}
        </Typography>
      )}
    </Paper>
  );
}
