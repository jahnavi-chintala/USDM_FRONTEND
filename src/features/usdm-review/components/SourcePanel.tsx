import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useEffect, useRef } from 'react';

import { ErrorAlert } from '@/shared/components/ErrorAlert';
import { LoadingState } from '@/shared/components/LoadingState';

import { highlightQuotes, type QuoteMark } from '../highlight';
import { useSourcePage } from '../hooks/useReview';

interface SourcePanelProps {
  protocolId: string;
  fileName: string;
  page: number;
  /** Quotes found on this page; `selectedId` is outlined more strongly. */
  marks: QuoteMark[];
  selectedId: string | null;
}

/** The protocol page the values come from, with their quotes highlighted. */
export function SourcePanel({ protocolId, fileName, page, marks, selectedId }: SourcePanelProps) {
  const source = useSourcePage(protocolId, page);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLElement>(null);

  // Bring the selected quote into view inside the page box only (it scrolls on large
  // screens); moving the whole window would pull the reviewer away from the values.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const mark = selectedRef.current;
    if (scroller && mark && scroller.scrollHeight > scroller.clientHeight) {
      scroller.scrollTo?.({ top: Math.max(0, mark.offsetTop - 48), behavior: 'smooth' });
    }
  }, [selectedId, source.data]);

  return (
    <Paper
      variant="outlined"
      component="section"
      id="source"
      aria-label="Source protocol page"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflow: 'hidden',
        scrollMarginTop: 80,
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h2">Source · page {page}</Typography>
        <Typography sx={{ fontSize: '0.75rem', overflowWrap: 'anywhere' }} color="text.secondary">
          {fileName}
        </Typography>
      </Box>
      <Box sx={{ p: 2, bgcolor: 'surface.subtle', flexGrow: 1 }}>
        {source.isPending && <LoadingState label="Loading the source page…" />}
        {source.isError && (
          <ErrorAlert
            title="The source page could not be loaded"
            error={source.error}
            onRetry={() => void source.refetch()}
          />
        )}
        {source.data && (
          <Box
            ref={scrollerRef}
            sx={{
              position: 'relative',
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: { xs: 2, sm: 3 },
              fontFamily: (t) => t.typography.quote.fontFamily,
              fontSize: '0.875rem',
              lineHeight: 1.7,
              maxHeight: { lg: 640 },
              overflowY: { lg: 'auto' },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: (t) => t.typography.fontFamily,
                fontSize: '0.6875rem',
                color: 'text.secondary',
                mb: 1.5,
              }}
            >
              <span>{fileName}</span>
              <span>
                Page {source.data.page} of {source.data.page_count}
              </span>
            </Box>
            {source.data.heading && (
              <Typography
                component="h3"
                sx={{ fontWeight: 600, fontSize: '1rem', fontFamily: 'inherit', mb: 1.25 }}
              >
                {source.data.heading}
              </Typography>
            )}
            {source.data.paragraphs.map((paragraph, index) => (
              <Box component="p" key={index} sx={{ m: 0, mb: 1.25 }}>
                {highlightQuotes(paragraph, marks).map((segment, part) =>
                  segment.markId ? (
                    <Box
                      component="mark"
                      key={part}
                      ref={segment.markId === selectedId ? selectedRef : undefined}
                      sx={(t) => ({
                        color: 'inherit',
                        borderRadius: '2px',
                        px: '1px',
                        ...(segment.markId === selectedId
                          ? {
                              bgcolor: alpha(t.palette.primary.main, 0.16),
                              boxShadow: `0 0 0 2px ${t.palette.primary.main}`,
                            }
                          : {
                              bgcolor: alpha(t.palette.brand.cyan, 0.22),
                              boxShadow: `0 0 0 2px ${alpha(t.palette.brand.cyan, 0.55)}`,
                            }),
                      })}
                    >
                      {segment.text}
                    </Box>
                  ) : (
                    segment.text
                  ),
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
