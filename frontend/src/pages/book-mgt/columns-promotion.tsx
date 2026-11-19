import dayjs from 'dayjs';

import { Stack, Typography } from '@mui/material';

import { translate } from 'src/locales';
import { MappingType } from 'src/pages/promotions-mgt/const-type';
import { formatPromotionValue } from 'src/pages/promotions-mgt/utils';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

export const columns: () => Columns<PromotionType>[] = () => [
  {
    label: translate('book.promotion.columns.code'),
    sort: 'code',
    render: (row) => (
      <Typography variant="body2" textTransform="uppercase">
        {row?.code}
      </Typography>
    ),
  },
  {
    label: translate('book.promotion.columns.name'),
    sort: 'name',
    render: ({ name, description }) => (
      <Stack overflow="hidden">
        <Typography variant="body2" noWrap>
          {name}
        </Typography>
        <Typography color="textSecondary" variant="caption">
          {description}
        </Typography>
      </Stack>
    ),
  },
  {
    label: translate('book.promotion.columns.type'),
    sort: 'type',
    render: (row) => (
      <Label
        color={MappingType[row?.type]?.color}
        startIcon={<Iconify icon={MappingType[row?.type]?.icon} />}
        sx={{ mr: 1 }}
      >
        {translate(`promotion.type.${row?.type}`)}
      </Label>
    ),
  },
  {
    label: translate('book.promotion.columns.value'),
    sort: 'value',
    render: (row) => (
      <Label data-promotion-value={row?.value} sx={{ textTransform: 'none' }}>
        {formatPromotionValue(row)}
      </Label>
    ),
  },
  {
    label: translate('book.promotion.columns.start'),
    sort: 'startDate',
    render: (row) => {
      const day = dayjs(row?.startDate);
      return (
        <Stack>
          <Typography variant="body2" noWrap>
            {day.format('DD MMM YYYY')}
          </Typography>
          <Typography color="textSecondary" variant="caption">
            {day.format('hh:mm A')}
          </Typography>
        </Stack>
      );
    },
  },
  {
    label: translate('book.promotion.columns.end'),
    sort: 'endDate',
    render: (row) => {
      const day = dayjs(row?.endDate);
      return (
        <Stack>
          <Typography variant="body2" noWrap>
            {day.format('DD MMM YYYY')}
          </Typography>
          <Typography color="textSecondary" variant="caption">
            {day.format('hh:mm A')}
          </Typography>
        </Stack>
      );
    },
  },
];

// Hàm (không phải hằng) để nhãn dịch theo ngôn ngữ hiện tại mỗi lần render
export const fields: () => FieldType<PromotionType>[] = () => [
  {
    name: 'name',
    label: translate('book.promotion.fields.name'),
    type: 'string',
  },
  {
    name: 'code',
    label: translate('book.promotion.fields.code'),
    type: 'string',
  },
  {
    name: 'type',
    label: translate('book.promotion.fields.type'),
    type: 'enums',
    options: ['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING'],
  },
  {
    name: 'value',
    label: translate('book.promotion.fields.value'),
    type: 'number',
  },
  {
    name: 'startDate',
    label: translate('book.promotion.fields.startDate'),
    type: 'date',
  },
  {
    name: 'endDate',
    label: translate('book.promotion.fields.endDate'),
    type: 'date',
  },
];
