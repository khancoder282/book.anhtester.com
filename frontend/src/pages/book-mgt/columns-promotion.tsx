import type { TFn } from 'src/locales';

import dayjs from 'dayjs';

import { Stack, Typography } from '@mui/material';

import { MappingType } from 'src/pages/promotions-mgt/const-type';
import { formatPromotionValue } from 'src/pages/promotions-mgt/utils';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// Nhận `t` thay vì gọi translate() bên trong: React Compiler nhớ kết quả của lời gọi không tham số,
// nên đổi ngôn ngữ thì tên cột giữ ngôn ngữ cũ (W21, mobile báo 2026-11-21)
export const columns = (t: TFn): Columns<PromotionType>[] => [
  {
    label: t('book.promotion.columns.code'),
    sort: 'code',
    render: (row) => (
      <Typography variant="body2" textTransform="uppercase">
        {row?.code}
      </Typography>
    ),
  },
  {
    label: t('book.promotion.columns.name'),
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
    label: t('book.promotion.columns.type'),
    sort: 'type',
    render: (row) => (
      <Label
        color={MappingType[row?.type]?.color}
        startIcon={<Iconify icon={MappingType[row?.type]?.icon} />}
        sx={{ mr: 1 }}
      >
        {t(`promotion.type.${row?.type}`)}
      </Label>
    ),
  },
  {
    label: t('book.promotion.columns.value'),
    sort: 'value',
    render: (row) => (
      <Label data-promotion-value={row?.value} sx={{ textTransform: 'none' }}>
        {formatPromotionValue(row)}
      </Label>
    ),
  },
  {
    label: t('book.promotion.columns.start'),
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
    label: t('book.promotion.columns.end'),
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

export const fields = (t: TFn): FieldType<PromotionType>[] => [
  {
    name: 'name',
    label: t('book.promotion.fields.name'),
    type: 'string',
  },
  {
    name: 'code',
    label: t('book.promotion.fields.code'),
    type: 'string',
  },
  {
    name: 'type',
    label: t('book.promotion.fields.type'),
    type: 'enums',
    options: ['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING'],
  },
  {
    name: 'value',
    label: t('book.promotion.fields.value'),
    type: 'number',
  },
  {
    name: 'startDate',
    label: t('book.promotion.fields.startDate'),
    type: 'date',
  },
  {
    name: 'endDate',
    label: t('book.promotion.fields.endDate'),
    type: 'date',
  },
];
