import { Box, Stack, Button, TextField, Autocomplete } from '@mui/material';

import Title from 'src/components/title';
import { toast } from 'src/components/toast';
import { dialog } from 'src/components/dialog-confirm/confirm';

export default function TestPage() {
  return (
    <Box sx={{ p: 3, minHeight: '100vh', overflow: 'visible' }}>
      <Title>Test</Title>

      <Stack spacing={3}>
        <Button variant="contained" onClick={() => dialog.message('Xin chao day la dialog')}>
          Test dialog
        </Button>

        <Button
          variant="contained"
          color="inherit"
          onClick={() => toast.loading(() => new Promise((resolve) => setTimeout(resolve, 5000)))}
        >
          Test toast
        </Button>

        {/* Test Autocomplete đơn giản nhất */}
        <Autocomplete
          options={['Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller']}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Movie" />}
        />

        {/* Test Autocomplete với disablePortal */}
        <Autocomplete
          disablePortal
          options={['Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller']}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Movie (No Portal)" />}
        />

        {/* Test Autocomplete với freeSolo */}
        <Autocomplete
          freeSolo
          options={['Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller']}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Movie (Free Solo)" />}
        />

        {/* Test Autocomplete với multiple */}
        <Autocomplete
          multiple
          options={['Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller']}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Movie (Multiple)" />}
        />
      </Stack>
    </Box>
  );
}
