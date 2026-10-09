import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { cropUrl } from '../api/reviewApi';
import type { BBox } from '../types';

interface SourceCropProps {
  sha: string;
  page: number;
  bbox: BBox;
  quote: string | null;
}

/**
 * The exact PDF region the field's quote was resolved to, rendered by the backend.
 * Not `loading="lazy"`: browsers never fetch a lazy image while it is hidden behind the
 * placeholder, so it would never appear.
 */
export function SourceCrop({ sha, page, bbox, quote }: SourceCropProps) {
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Page {page}
        {quote && <> · quote: “{quote}”</>}
      </Typography>
      {state === 'loading' && <Skeleton variant="rectangular" width={480} height={80} />}
      {state === 'error' ? (
        <Alert severity="warning">The source image could not be loaded.</Alert>
      ) : (
        <Box
          component="img"
          src={cropUrl(sha, page, bbox)}
          alt={`Source crop, page ${page}`}
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          sx={{
            display: state === 'loaded' ? 'block' : 'none',
            maxWidth: '100%',
            width: 480,
            border: 1,
            borderColor: 'divider',
          }}
        />
      )}
    </Box>
  );
}
