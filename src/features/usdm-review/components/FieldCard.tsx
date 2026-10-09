import CheckIcon from '@mui/icons-material/Check';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import type { ExtractedField } from '../types';

interface FieldCardProps {
  field: ExtractedField;
  /** The field whose quote is outlined on the source page. */
  selected: boolean;
  onSelect: () => void;
  /** Set while the class is being edited: the value becomes an input. */
  editValue?: string;
  onEditValue?: (value: string) => void;
}

/** One extracted value with the verbatim quote it was taken from. */
export function FieldCard({ field, selected, onSelect, editValue, onEditValue }: FieldCardProps) {
  const editing = editValue !== undefined && onEditValue !== undefined;

  return (
    <Box
      component="article"
      aria-label={field.label}
      // A click anywhere on the card shows its quote; keyboard users have the link below.
      onClick={editing ? undefined : onSelect}
      sx={(theme) => ({
        borderRadius: 2.5,
        px: 1.75,
        py: 1.5,
        border: 1,
        borderColor: selected ? 'primary.main' : 'divider',
        boxShadow: selected ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}` : 'none',
        cursor: editing ? 'default' : 'pointer',
      })}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 1,
          typography: 'overline',
          color: 'text.secondary',
          textTransform: 'uppercase',
        }}
      >
        <span>{field.label}</span>
        <Box
          component="span"
          sx={{
            color: 'primary.main',
            bgcolor: 'primary.light',
            borderRadius: 1.5,
            px: 0.75,
            textTransform: 'none',
          }}
        >
          p. {field.page}
        </Box>
      </Box>
      {editing ? (
        <TextField
          fullWidth
          size="small"
          value={editValue}
          onChange={(event) => onEditValue(event.target.value)}
          slotProps={{ htmlInput: { 'aria-label': field.label } }}
          sx={{ my: 0.75 }}
        />
      ) : (
        <Typography sx={{ fontWeight: 700, fontSize: '0.90625rem', mt: 0.5, mb: 0.75 }}>
          {field.value}
        </Typography>
      )}
      <Typography
        variant="quote"
        component="blockquote"
        sx={{
          m: 0,
          color: 'surface.mutedText',
          borderLeft: 3,
          borderColor: 'brand.cyan',
          pl: 1.25,
        }}
      >
        “{field.quote}”
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1,
          mt: 0.75,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
          color={field.quote_located ? 'success.dark' : 'warning.dark'}
        >
          {field.quote_located ? (
            <>
              <CheckIcon sx={{ fontSize: 14 }} /> Verbatim quote located on page {field.page}
            </>
          ) : (
            <>Quote not found word for word on page {field.page}; check it carefully</>
          )}
        </Typography>
        <Link
          href="#source"
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
          sx={{ fontSize: '0.78125rem', fontWeight: 700 }}
        >
          View on page {field.page}
        </Link>
      </Box>
    </Box>
  );
}
