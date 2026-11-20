import dayjs from 'dayjs';

import { Box, Stack, Typography } from '@mui/material';

import { translate } from 'src/locales';
import { BookCover } from 'src/pages/book-mgt/components/book-cover';

import { svgColorClasses } from 'src/components/svg-color';

export const columns: () => Columns<BookView>[] = () => [
  {
    label: translate('promotion.books.columns.name'),
    sort: 'name',
    render: ({ name, picture, description }) => (
      <Stack overflow="hidden" direction="row" gap={2} alignItems="center">
        {/* Bìa dọc 2:3 như bìa sách thật, giống dòng sách trong giỏ hàng */}
        <Box
          sx={{
            width: 44,
            flexShrink: 0,
            borderRadius: '2px 6px 6px 2px',
            overflow: 'hidden',
            boxShadow: '2px 4px 10px -2px rgba(15,23,42,.25)',
          }}
        >
          <BookCover
            src={picture[0]}
            name={name}
            sx={{
              aspectRatio: '2 / 3',
              p: 0.5,
              '& .MuiTypography-root': { display: 'none' },
              [`& .${svgColorClasses.root}`]: { width: 18, height: 18 },
            }}
          />
        </Box>
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
    label: translate('promotion.books.columns.price'),
    sort: 'price',
    render: ({ price }) => (
      <Typography variant="body2">
        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
      </Typography>
    ),
  },
  {
    label: translate('promotion.books.columns.created'),
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

/** Gọi lúc render (không để hằng số cấp module) để nhãn theo ngôn ngữ hiện tại */
export const getFilter = (): FieldType<BookView>[] => [
  {
    name: 'name',
    type: 'string',
    label: translate('promotion.books.fields.name'),
  },
  {
    name: 'description',
    type: 'string',
    label: translate('promotion.books.fields.description'),
  },
  {
    name: 'price',
    type: 'number',
    label: translate('promotion.books.fields.price'),
  },
  {
    name: 'createdAt',
    type: 'date',
    label: translate('promotion.books.fields.created'),
  },
];
