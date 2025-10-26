import dayjs from 'dayjs';
import { useState } from 'react';
import { useWatch, Controller } from 'react-hook-form';

import { Box, Card, Stack, Divider, Collapse, CardHeader, IconButton } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { DatePickerField } from 'src/components/fields/date-picker-field';

import { control } from '../hooks/form-control';

export function CardStatus() {
  const [expen, setExpen] = useState(true);
  const [startDate] = useWatch({ control, name: ['startDate'] });

  return (
    <Card>
      <CardHeader
        title="Status"
        subheader="Start date, end date, active"
        action={
          <IconButton onClick={() => setExpen(!expen)}>
            <Iconify
              sx={{ transition: 'all .1s ease-in-out' }}
              style={{ rotate: !expen ? '0deg' : '90deg' }}
              icon="eva:arrow-ios-forward-fill"
            />
          </IconButton>
        }
        sx={{ mb: 3 }}
      />
      <Collapse in={expen}>
        <Divider />
        <Stack spacing={3} p={3}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'start',
              flexDirection: {
                xs: 'column',
                md: 'row',
              },
              '& > div': {
                flex: 1,
              },
            }}
          >
            <Controller
              control={control}
              name="startDate"
              defaultValue={dayjs()}
              rules={{
                required: 'Start date is required.',
                deps: ['endDate'],
              }}
              render={({ field, fieldState: { invalid, error } }) => (
                <DatePickerField
                  label="Start date"
                  {...field}
                  error={invalid}
                  helperText={error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="endDate"
              defaultValue={dayjs().add(7, 'day')}
              rules={{
                required: 'End date is required.',
                validate: (value) => value > startDate || 'End date must be in the future.',
              }}
              render={({ field, fieldState: { invalid, error } }) => (
                <DatePickerField
                  label="End date"
                  {...field}
                  minDate={startDate}
                  error={invalid}
                  helperText={error?.message}
                />
              )}
            />
          </Box>
        </Stack>
      </Collapse>
    </Card>
  );
}
