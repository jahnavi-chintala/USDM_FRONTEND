import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import type { ProtocolSummary } from '../types';

function greeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

interface HomeHeroProps {
  protocols: ProtocolSummary[] | undefined;
  reviewerName: string;
  now?: Date;
}

/** Greeting and the four counts of the dashboard. */
export function HomeHero({ protocols = [], reviewerName, now = new Date() }: HomeHeroProps) {
  const count = (status: ProtocolSummary['status']) =>
    protocols.filter((p) => p.status === status).length;
  const stats = [
    { label: 'Processing', value: count('processing') },
    { label: 'Ready for review', value: count('in_review') },
    { label: 'Need attention', value: count('failed') },
    { label: 'Approved', value: count('approved') },
  ];

  return (
    <Paper
      component="section"
      aria-labelledby="home-greeting"
      sx={{
        bgcolor: 'brand.navy',
        color: 'common.white',
        borderRadius: 4,
        p: { xs: 2.5, sm: 3.5 },
        display: 'flex',
        flexDirection: 'column',
        gap: 1.75,
      }}
    >
      <Typography id="home-greeting" variant="h1" sx={{ fontSize: '1.625rem' }}>
        {greeting(now)}, {reviewerName}
      </Typography>
      <Typography sx={{ color: 'brand.navyText', maxWidth: 440 }}>
        Upload a clinical protocol and iDigitise converts it to CDISC USDM 4.0. Every value is
        traced to its source page for you to verify.
      </Typography>
      <Box
        component="dl"
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, m: 0 }}
        aria-label="Protocol counts"
      >
        {stats.map((stat) => (
          <Box
            key={stat.label}
            sx={{
              bgcolor: 'brand.navyRaised',
              border: 1,
              borderColor: 'brand.navyBorder',
              borderRadius: 3,
              px: 1.75,
              py: 1.25,
              minWidth: 110,
              display: 'flex',
              flexDirection: 'column-reverse',
            }}
          >
            <Typography component="dt" sx={{ fontSize: '0.75rem', color: 'brand.navyText' }}>
              {stat.label}
            </Typography>
            <Typography component="dd" sx={{ m: 0, fontSize: '1.375rem', fontWeight: 800 }}>
              {stat.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
