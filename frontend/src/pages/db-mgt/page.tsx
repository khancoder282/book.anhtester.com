import { Box, Card, Typography } from '@mui/material';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import Title from 'src/components/title';

export default function Page() {
  return (
    <>
      <Title>Database Management - {CONFIG.appName}</Title>
      <DashboardContent sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            mb: 5,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            Database Management
          </Typography>
        </Box>
        <Card
          component="iframe"
          sx={{
            flex: 1,
            border: 0,
          }}
        />
      </DashboardContent>
    </>
  );
}
