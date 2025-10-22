import { Box, Card, Button, Typography } from '@mui/material';

import { useAuth } from 'src/store/auth';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import FileContentView from './file-content-view';
import { useDialogUpload } from '../store/use-dialog-upload';

export function FilePageView() {
  const { auth } = useAuth();
  const { setOpen } = useDialogUpload();

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          File management
        </Typography>
        {auth && (
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="solar:cloud-upload-bold" />}
            onClick={() => setOpen(true)}
          >
            Upload file
          </Button>
        )}
      </Box>
      <Card>
        <FileContentView root="/" />
      </Card>
    </DashboardContent>
  );
}
