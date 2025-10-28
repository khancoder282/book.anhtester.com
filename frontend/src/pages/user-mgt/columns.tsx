import dayjs from 'dayjs';

import { Stack, Badge, Avatar, Typography } from '@mui/material';

import { formatFilePath } from 'src/utils/format-filepath';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

export const columns: (user: User | null, reload: () => void) => Columns<User>[] = (
  user,
  reload
) => [
  {
    label: 'Name',
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
                boxShadow: t=>t.customShadows.z8,
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
          <Typography variant="subtitle2" noWrap>
            {name} {id === user?.id && <Label>You</Label>}
          </Typography>
          <Typography noWrap color="textSecondary" variant="caption">
            {email}
          </Typography>
        </Stack>
      </Stack>
    ),
  },
  {
    label: 'Phone',
    sort: 'phone',
    render: (row) => <Typography variant="body2">{row.phone}</Typography>,
  },
  {
    label: 'Address',
    sort: 'address',
    render: (row) => <Typography variant="body2">{row.address}</Typography>,
  },
  {
    label: 'Active',
    sort: 'isActive',
    render: (row) =>
      row.isActive ? <Label color="success">Active</Label> : <Label color="error">Inactive</Label>,
  },
  {
    label: 'Created',
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
    label: 'Updated',
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
export const fieldOptions: FieldType<User>[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'string',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'string',
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'string',
  },
  {
    name: 'address',
    label: 'Address',
    type: 'string',
  },
  {
    name: 'isActive',
    label: 'Is Active',
    type: 'boolean',
  },
  {
    name: 'createdAt',
    label: 'Created At',
    type: 'date',
  },
  {
    name: 'updatedAt',
    label: 'Updated At',
    type: 'date',
  },
];
