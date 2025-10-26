import dayjs from 'dayjs';

import { Stack, Avatar, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

export const columns: () => Columns<BookView>[] = () => [
  {
    label: 'Name',
    sort: 'name',
    render: ({ name, picture, description }) => (
      <Stack overflow="hidden" direction="row" gap={2}>
        <Avatar src={picture[0]} variant="rounded">
          <Iconify icon="solar:album-outline" />
        </Avatar>
        <Stack flex={1} overflow="hidden">
          <Typography variant="body2" noWrap>
            {name}
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {description}
          </Typography>
        </Stack>
      </Stack>
    ),
  },
  {
    label: 'Price',
    sort: 'price',
    render: ({ price }) => (
      <Typography variant="body2">
        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
      </Typography>
    ),
  },
  {
    label: 'Created',
    sort: 'createdAt',
    render: ({ createdAt }) => (
      <Stack>
        <Typography variant="body2" noWrap>
          {dayjs(createdAt).format('DD MMM YYYY')}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {dayjs(createdAt).format('hh:mm A')}
        </Typography>
      </Stack>
    ),
  },
];

export const filter: FieldType<BookView>[] = [
  {
    name: 'name',
    type: 'string',
    label: 'Name',
  },
  {
    name: 'description',
    type: 'string',
    label: 'Description',
  },
  {
    name: 'price',
    type: 'number',
    label: 'Price',
  },
  {
    name: 'createdAt',
    type: 'date',
    label: 'Created',
  },
];
