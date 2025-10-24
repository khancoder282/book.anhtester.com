import { Box, Stack, Typography } from '@mui/material';

import { ImgPreview } from './Img-preview';
import { formatSize, formatType } from '../upload-field';

export function PreviewFile({
  file,
  isPreview = false,
  sx,
  show = ['size', 'type'],
}: {
  file: File | FileItem;
  isPreview?: boolean;
  sx?: Sx;
  show?: ('path' | 'size' | 'type')[];
}) {
  return (
    <Box
      sx={{
        gap: 1.5,
        p: 1,
        pl: 1.5,
        border: 1,
        borderRadius: 1,
        borderColor: 'divider',
        alignItems: 'center',
        display: 'flex',
        width: 1,
        bgcolor: 'background.paper',
        ...sx,
      }}
    >
      <ImgPreview file={file} isPreview={isPreview} />
      <Stack flex={1} overflow="hidden">
        <Typography flex={1} variant="body1" width={1} noWrap overflow="hidden">
          {file.name}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {show.map((f) => showInfo[f](file)).join(' - ')}
        </Typography>
      </Stack>
    </Box>
  );
}

const showInfo = {
  path: (f: FileItem | File) => (f instanceof File ? f.name : f.path),
  size: (f: FileItem | File) => formatSize(f.size),
  type: (f: FileItem | File) => formatType(f.type),
};
