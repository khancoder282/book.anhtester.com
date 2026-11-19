import dayjs from 'dayjs';
import { useState } from 'react';
import { useWatch, Controller } from 'react-hook-form';

import { Box, Card, Stack, Divider, Collapse, CardHeader, IconButton } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { DatePickerField } from 'src/components/fields/date-picker-field';

import { control } from '../hooks/form-control';

export function CardStatus() {
  const [expen, setExpen] = useState(true);
  const { t } = useTranslate();
  const [startDate] = useWatch({ control, name: ['startDate'] });

  return (
    <Card>
      <CardHeader
        title={t('promotion.status.label')}
        subheader={t('promotion.statusCard.subheader')}
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
                required: t('promotion.statusCard.startRequired'),
                deps: ['endDate'],
              }}
              render={({ field, fieldState: { invalid, error } }) => (
                <DatePickerField
                  label={t('promotion.statusCard.startDate')}
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
                required: t('promotion.statusCard.endRequired'),
                validate: (value) => value > startDate || t('promotion.statusCard.endFuture'),
              }}
              render={({ field, fieldState: { invalid, error } }) => (
                <DatePickerField
                  label={t('promotion.statusCard.endDate')}
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
