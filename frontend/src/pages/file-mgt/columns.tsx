import dayjs from 'dayjs';

import { Box, Stack, Typography } from '@mui/material';

import { translate } from 'src/locales';

import { formatSize } from 'src/components/fields/upload-field';
import { ImgPreview } from 'src/components/fields/components/Img-preview';

export const columns: (isPreview: boolean) => Columns<FileItem>[] = (isPreview) => [
  {
    label: translate('file.columns.name'),
    sort: 'name',
    render: (file) => (
      <Box
        display="flex"
        gap={2}
        alignItems="center"
        sx={{
          width: {
            xs: 200,
            lg: 350,
          },
        }}
      >
        <ImgPreview file={file} isPreview={isPreview} />
        <Typography
          typography="body2"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {file.name}
        </Typography>
      </Box>
    ),
  },
  {
    label: translate('file.columns.size'),
    sort: 'size',
    render: (row) => (
      <Typography variant="body2" noWrap>
        {(row.isFile && formatSize(row.size ?? 0)) || '-'}
      </Typography>
    ),
  },
  {
    label: translate('file.columns.type'),
    sort: 'type',
    render: (row) => (
      <Typography variant="body2" noWrap>
        {row.type.split('/').at(-1)?.split(';')[0] || '-'}
      </Typography>
    ),
  },
  {
    label: translate('file.columns.modified'),
    sort: 'modified',
    render: (row) => (
      <Stack>
        <Typography variant="body2" noWrap>
          {dayjs(row.modified).format('DD MMM YYYY')}
        </Typography>
        <Typography color="textSecondary" variant="caption">
          {dayjs(row.modified).format('hh:mm A')}
        </Typography>
      </Stack>
    ),
  },
];
