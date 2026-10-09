import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { useState } from 'react';

/**
 * A collapsible view of a JSON value.
 *
 * Children are rendered only when their parent is expanded, so a large USDM document
 * (thousands of nodes) stays fast: only what the user opens is in the DOM.
 */
interface JsonTreeProps {
  data: unknown;
  /** Levels expanded on first render. */
  initialDepth?: number;
}

type Container = Record<string, unknown> | unknown[];

function isContainer(value: unknown): value is Container {
  return typeof value === 'object' && value !== null;
}

function summary(value: Container): string {
  return Array.isArray(value) ? `[${value.length}]` : `{${Object.keys(value).length}}`;
}

function Primitive({ value }: { value: unknown }) {
  if (value === null)
    return (
      <Box component="span" sx={{ color: 'text.disabled' }}>
        null
      </Box>
    );
  if (typeof value === 'string') {
    return (
      <Box component="span" sx={{ color: 'success.dark', overflowWrap: 'anywhere' }}>
        &quot;{value}&quot;
      </Box>
    );
  }
  if (typeof value === 'number')
    return (
      <Box component="span" sx={{ color: 'info.dark' }}>
        {value}
      </Box>
    );
  if (typeof value === 'boolean') {
    return (
      <Box component="span" sx={{ color: 'secondary.main' }}>
        {String(value)}
      </Box>
    );
  }
  return <span>{String(value)}</span>;
}

function JsonNode({
  name,
  value,
  depth,
  initialDepth,
}: {
  name: string;
  value: unknown;
  depth: number;
  initialDepth: number;
}) {
  const [open, setOpen] = useState(depth < initialDepth);

  if (!isContainer(value)) {
    return (
      <Box component="li" sx={{ pl: 3 }}>
        <Box component="span" sx={{ color: 'text.secondary' }}>
          {name}:{' '}
        </Box>
        <Primitive value={value} />
      </Box>
    );
  }

  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : Object.entries(value);

  return (
    <Box component="li">
      <ButtonBase
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        sx={{ font: 'inherit', borderRadius: 1, pr: 0.5, '&:hover': { bgcolor: 'action.hover' } }}
      >
        {open ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
        <Box component="span" sx={{ color: 'text.secondary' }}>
          {name}
        </Box>
        <Box component="span" sx={{ ml: 1, color: 'text.disabled' }}>
          {summary(value)}
        </Box>
      </ButtonBase>
      {open && entries.length > 0 && (
        <Box component="ul" sx={{ listStyle: 'none', m: 0, pl: 2.5 }}>
          {entries.map(([key, child]) => (
            <JsonNode
              key={key}
              name={key}
              value={child}
              depth={depth + 1}
              initialDepth={initialDepth}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

export function JsonTree({ data, initialDepth = 1 }: JsonTreeProps) {
  return (
    <Box
      component="ul"
      aria-label="USDM document"
      sx={{ listStyle: 'none', m: 0, p: 0, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.7 }}
    >
      <JsonNode name="document" value={data} depth={0} initialDepth={initialDepth} />
    </Box>
  );
}
