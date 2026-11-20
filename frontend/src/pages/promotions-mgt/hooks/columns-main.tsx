import dayjs from 'dayjs';

import { Stack, Typography } from '@mui/material';

import { translate } from 'src/locales';
import { MappingType } from 'src/pages/promotions-mgt/const-type';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { getPromotionStatus, formatPromotionValue, PROMOTION_STATUS_COLOR } from '../utils';

export const columns: () => Columns<PromotionType>[] = () => [
  {
    label: translate('promotion.columns.code'),
    sort: 'code',
    render: (row) => (
      <Typography
        data-testid={`promotion-row-code-${row?.id}`}
        variant="body2"
        textTransform="uppercase"
        fontWeight="bold"
      >
        {row?.code}
      </Typography>
    ),
  },
  {
    label: translate('promotion.columns.name'),
    sort: 'name',
    render: ({ id, name, description }) => (
      <Stack overflow="hidden">
        <Typography data-testid={`promotion-row-name-${id}`} variant="body2" noWrap>
          {name}
        </Typography>
        <Typography color="textSecondary" variant="caption">
          {description}
        </Typography>
      </Stack>
    ),
  },
  {
    label: translate('promotion.columns.type'),
    sort: 'type',
    render: (row) => (
      <Label
        data-testid={`promotion-row-type-${row?.id}`}
        color={MappingType[row?.type]?.color}
        startIcon={<Iconify icon={MappingType[row?.type]?.icon} />}
        sx={{ mr: 1 }}
      >
        {translate(`promotion.type.${row?.type}`)}
      </Label>
    ),
  },
  {
    label: translate('promotion.status.label'),
    sort: 'isActive',
    render: (row) => {
      const status = getPromotionStatus(row);
      return (
        <Label
          data-testid={`promotion-row-status-${row.id}`}
          color={PROMOTION_STATUS_COLOR[status]}
          data-status={status}
        >
          {translate(`promotion.status.${status}`)}
        </Label>
      );
    },
  },
  {
    label: translate('promotion.columns.value'),
    sort: 'value',
    render: (row) => (
      <Label
        data-testid={`promotion-row-value-${row?.id}`}
        data-promotion-value={row?.value}
        sx={{ textTransform: 'none' }}
      >
        {formatPromotionValue(row)}
      </Label>
    ),
  },
  {
    label: translate('promotion.columns.start'),
    sort: 'startDate',
    render: (row) => {
      const day = dayjs(row?.startDate);
      return (
        <Stack>
          <Typography
            color={
              day.isBefore(dayjs()) ? 'primary' : day.isAfter(dayjs()) ? 'error' : 'textSecondary'
            }
            variant="body2"
            noWrap
          >
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
    label: translate('promotion.columns.end'),
    sort: 'endDate',
    render: (row) => {
      const day = dayjs(row?.endDate);
      return (
        <Stack>
          <Typography
            color={
              day.isBefore(dayjs()) ? 'error' : day.isAfter(dayjs()) ? 'primary' : 'textSecondary'
            }
            variant="body2"
            noWrap
          >
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
    label: translate('promotion.columns.created'),
    sort: 'createdAt',
    render: (row) => {
      const day = dayjs(row?.createdAt);
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

/** Gọi lúc render (không để hằng số cấp module) để nhãn theo ngôn ngữ hiện tại */
export const getFields = (): FieldType<PromotionType>[] => [
  {
    name: 'name',
    label: translate('promotion.fields.name'),
    type: 'string',
  },
  {
    name: 'code',
    label: translate('promotion.fields.code'),
    type: 'string',
  },
  {
    name: 'type',
    label: translate('promotion.fields.type'),
    type: 'enums',
    options: ['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING'],
  },
  {
    name: 'value',
    label: translate('promotion.fields.value'),
    type: 'number',
  },
  {
    name: 'startDate',
    label: translate('promotion.fields.startDate'),
    type: 'date',
  },
  {
    name: 'endDate',
    label: translate('promotion.fields.endDate'),
    type: 'date',
  },
];
