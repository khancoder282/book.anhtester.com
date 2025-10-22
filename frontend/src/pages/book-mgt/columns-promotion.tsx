import dayjs from 'dayjs';

import { Stack, Typography } from '@mui/material';

import { MappingType } from 'src/pages/promotions-mgt/const-type';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

export const columns: () => Columns<PromotionType>[] = () => [
  {
    label: 'CODE',
    sort: 'code',
    render: (row) => (
      <Typography variant="body2" noWrap fontWeight="bold" textTransform="uppercase">
        {row?.code}
      </Typography>
    ),
  },
  {
    label: 'Name',
    sort: 'name',
    render: (row) => (
      <Typography variant="body2" noWrap width={200}>
        {row?.name}
      </Typography>
    ),
  },
  {
    label: 'Type',
    sort: 'type',
    render: (row) => (
      <Label
        color={MappingType[row?.type]?.color}
        startIcon={<Iconify icon={MappingType[row?.type]?.icon} />}
        sx={{ mr: 1}}
      >
        {row?.type}
      </Label>
    ),
  },
  {
    label: 'Value',
    sort: 'value',
    render: (row) => <Label>{row?.value}</Label>,
  },
  {
    label: 'Status',
    sort: 'isActive',
    render: (row) => (
      <Label color={row?.isActive ? 'success' : 'error'}>
        {row?.isActive ? 'Active' : 'Inactive'}
      </Label>
    ),
  },
  {
    label: 'Start',
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
    label: 'End',
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

export const fields: FieldType<PromotionType>[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'string',
  },
  {
    name: 'code',
    label: 'Code',
    type: 'string',
  },
  {
    name: 'type',
    label: 'Type',
    type: 'enums',
    options: ['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING'],
  },
  {
    name: 'value',
    label: 'Value',
    type: 'number',
  },
  {
    name: 'startDate',
    label: 'Start Date',
    type: 'date',
  },
  {
    name: 'endDate',
    label: 'End Date',
    type: 'date',
  },
];
