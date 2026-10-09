import CheckIcon from '@mui/icons-material/Check';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { visuallyHidden } from '@/shared/styles/visuallyHidden';

import type { SoaGrid } from '../types';

/** The extracted Schedule of Activities, for visual reference against the source table. */
export function SoaTable({ soa }: { soa: SoaGrid }) {
  return (
    <div>
      <Box sx={{ overflowX: 'auto', border: 1, borderColor: 'divider', borderRadius: 2.5 }}>
        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.78125rem',
            '& th, & td': { px: 1, py: 0.875, borderBottom: 1, borderColor: 'surface.rule' },
            '& tbody tr:last-child td, & tbody tr:last-child th': { borderBottom: 0 },
          }}
        >
          <Box component="caption" sx={visuallyHidden}>
            Schedule of Activities
          </Box>
          <Box component="thead" sx={{ bgcolor: 'surface.subtle', color: 'text.secondary' }}>
            <tr>
              <Box component="th" scope="col" sx={{ textAlign: 'left' }}>
                Activity
              </Box>
              {soa.visits.map((visit) => (
                <Box component="th" scope="col" key={visit} sx={{ textAlign: 'center' }}>
                  {visit}
                </Box>
              ))}
            </tr>
          </Box>
          <tbody>
            {soa.activities.map((activity) => (
              <tr key={activity.name}>
                <Box component="th" scope="row" sx={{ textAlign: 'left', fontWeight: 700 }}>
                  {activity.name}
                </Box>
                {activity.scheduled.map((scheduled, index) => (
                  <Box
                    component="td"
                    key={soa.visits[index] ?? index}
                    sx={{ textAlign: 'center', color: 'primary.main' }}
                  >
                    {scheduled ? (
                      <CheckIcon sx={{ fontSize: 16 }} aria-label="Scheduled" />
                    ) : (
                      <span aria-label="Not scheduled" />
                    )}
                  </Box>
                ))}
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
      <Typography sx={{ fontSize: '0.75rem', mt: 0.75 }} color="text.secondary">
        This table mirrors the protocol for visual reference only. Make corrections in the fields
        below.
      </Typography>
    </div>
  );
}
