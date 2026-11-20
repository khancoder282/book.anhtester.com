import dayjs from 'dayjs';

import { Stack, Badge, Avatar, Typography } from '@mui/material';

import { formatFilePath } from 'src/utils/format-filepath';

import { translate } from 'src/locales';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

export const columns: (user: User | null, reload: () => void) => Columns<User>[] = (
  user,
  reload
) => [
  {
    label: translate('common.fields.name'),
    sort: 'name',
    render: ({ avatarUrl, name, email, isActive, id }) => (
      <Stack direction="row" spacing={1}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <Avatar
              sx={{
                width: 18,
                height: 18,
                bgcolor: isActive ? 'success.main' : 'error.main',
                boxShadow: (t) => t.customShadows.z8,
              }}
            >
              <Iconify
                width={0.6}
                icon={!isActive ? 'solar:lock-keyhole-bold' : 'solar:lock-keyhole-unlocked-bold'}
              />
            </Avatar>
          }
        >
          <Avatar src={formatFilePath(avatarUrl)} />
        </Badge>
        <Stack flex={1} overflow="hidden">
          <Typography data-testid={`user-row-name-${id}`} variant="subtitle2" noWrap>
            {name}{' '}
            {id === user?.id && (
              <Label data-testid={`user-row-you-${id}`}>{translate('user.you')}</Label>
            )}
          </Typography>
          <Typography
            data-testid={`user-row-email-${id}`}
            noWrap
            color="textSecondary"
            variant="caption"
          >
            {email}
          </Typography>
        </Stack>
      </Stack>
    ),
  },
  {
    label: translate('common.fields.phone'),
    sort: 'phone',
    render: (row) => (
      <Typography data-testid={`user-row-phone-${row.id}`} variant="body2">
        {row.phone}
      </Typography>
    ),
  },
  {
    label: translate('common.fields.address'),
    sort: 'address',
    render: (row) => (
      <Typography data-testid={`user-row-address-${row.id}`} variant="body2">
        {row.address}
      </Typography>
    ),
  },
  {
    label: translate('user.columns.active'),
    sort: 'isActive',
    render: (row) =>
      row.isActive ? (
        <Label data-testid={`user-row-status-${row.id}`} color="success">
          {translate('user.status.active')}
        </Label>
      ) : (
        <Label data-testid={`user-row-status-${row.id}`} color="error">
          {translate('user.status.inactive')}
        </Label>
      ),
  },
  {
    label: translate('common.fields.createdAt'),
    sort: 'createdAt',
    render: (row) => (
      <Stack>
        <Typography noWrap>{dayjs(row.createdAt).format('DD MMM YYYY')}</Typography>
        <Typography color="textSecondary" variant="caption">
          {dayjs(row.createdAt).format('hh:mm A')}
        </Typography>
      </Stack>
    ),
  },
  {
    label: translate('common.fields.updatedAt'),
    sort: 'updatedAt',
    render: (row) => (
      <Stack>
        <Typography noWrap>{dayjs(row.updatedAt).format('DD MMM YYYY')}</Typography>
        <Typography color="textSecondary" variant="caption">
          {dayjs(row.updatedAt).format('hh:mm A')}
        </Typography>
      </Stack>
    ),
  },
];
/** Hàm, không phải hằng số: gọi lúc render để nhãn theo ngôn ngữ hiện tại. */
export const fieldOptions = (): FieldType<User>[] => [
  {
    name: 'name',
    label: translate('common.fields.name'),
    type: 'string',
  },
  {
    name: 'email',
    label: translate('common.fields.email'),
    type: 'string',
  },
  {
    name: 'phone',
    label: translate('common.fields.phone'),
    type: 'string',
  },
  {
    name: 'address',
    label: translate('common.fields.address'),
    type: 'string',
  },
  {
    name: 'isActive',
    label: translate('user.filter.isActive'),
    type: 'boolean',
  },
  {
    name: 'createdAt',
    label: translate('user.filter.createdAt'),
    type: 'date',
  },
  {
    name: 'updatedAt',
    label: translate('user.filter.updatedAt'),
    type: 'date',
  },
];
