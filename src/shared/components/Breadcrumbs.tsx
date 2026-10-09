import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';

export interface Crumb {
  label: string;
  /** Omitted for the current page. */
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <MuiBreadcrumbs aria-label="Breadcrumb" sx={{ fontSize: '0.8125rem' }}>
      {items.map((item) =>
        item.to ? (
          <Link
            key={item.label}
            component={RouterLink}
            to={item.to}
            underline="hover"
            sx={{ fontWeight: 700 }}
          >
            {item.label}
          </Link>
        ) : (
          <Typography key={item.label} sx={{ fontSize: 'inherit' }} color="text.secondary">
            {item.label}
          </Typography>
        ),
      )}
    </MuiBreadcrumbs>
  );
}
