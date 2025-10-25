import dayjs from 'dayjs';
import { toast } from 'sonner';

import { Box, Stack, Divider, Tooltip, Typography } from '@mui/material';

import { formatFilePath } from 'src/utils/format-filepath';

import { formatSize } from 'src/components/fields/upload-field';

export function ViewType({ file }: { file?: FileItem }) {
  return (
    <Stack spacing={2} overflow="hidden">
      {file?.type.startsWith('image') && (
        <Box
          component="img"
          loading="lazy"
          src={formatFilePath(file?.path)}
          sx={{
            width: '100%',
            maxHeight: 350,
            minHeight: 200,
            objectFit: 'contain',
            borderRadius: 1,
            bgcolor: 'background.neutral',
            boxShadow: (t) => t.customShadows.z8,
          }}
        />
      )}
      <Typography
        variant="h6"
        sx={{
          cursor: 'pointer',
          overflow: 'hidden',
          overflowWrap: 'anywhere',
          wordBreak: 'break-all',
          whiteSpace: 'normal',
        }}
      >
        {file?.name}
      </Typography>

      <Divider style={{ borderStyle: 'dashed' }} />

      <Stack sx={{ typography: 'caption', overflow: 'hidden' }}>
        <Typography variant="subtitle2">Properties</Typography>
        <Box>
          <Typography display="inline-block" width={80} variant="caption" color="textSecondary">
            Size
          </Typography>
          {formatSize(file?.size || 0)}
        </Box>
        <Box>
          <Typography display="inline-block" width={80} variant="caption" color="textSecondary">
            Modified
          </Typography>
          {dayjs(file?.modified).format('DD MMM YYYY hh:mm A')}
        </Box>
        <Box>
          <Typography display="inline-block" width={80} variant="caption" color="textSecondary">
            Type
          </Typography>
          {file?.type}
        </Box>
      </Stack>

      <Stack>
        <Typography variant="subtitle2">Link path</Typography>
        <Tooltip title={file?.path} arrow placement="auto">
          <Typography
            variant="caption"
            color="primary"
            sx={{
              cursor: 'pointer',
              overflow: 'hidden',
              overflowWrap: 'anywhere',
              wordBreak: 'break-all',
              whiteSpace: 'normal',
            }}
            onClick={async () => {
              if (file?.path) {
                navigator.clipboard.writeText(file?.path);
                toast.success('Copied to clipboard');
              }
            }}
          >
            {file?.path}
          </Typography>
        </Tooltip>
      </Stack>
    </Stack>
  );
}
