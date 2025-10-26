import { useState } from 'react';
import { useWatch, Controller } from 'react-hook-form';

import {
  Card,
  Stack,
  Divider,
  Collapse,
  MenuItem,
  TextField,
  CardHeader,
  IconButton,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { control, TypePromotion } from '../hooks/form-control';

export function CardDetail() {
  const [expen, setExpen] = useState(true);
  const [type] = useWatch({
    control,
    name: ['type'],
  });

  return (
    <Card>
      <CardHeader
        title="Detail"
        subheader="Title, description, picture"
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
          <Controller
            control={control}
            name="name"
            defaultValue=""
            rules={{
              required: 'Name is required.',
              maxLength: {
                value: 100,
                message: 'Name must be less than 100 characters.',
              },
            }}
            render={({ field, fieldState: { invalid, error } }) => (
              <TextField
                fullWidth
                label="Promotion name"
                {...field}
                error={invalid}
                helperText={error?.message}
                required
              />
            )}
          />
          <Controller
            name="code"
            control={control}
            defaultValue=""
            rules={{
              required: 'Code is required.',
              validate: (value) => value.length === 6 || 'Code must be 6 characters.',
            }}
            render={({ field, fieldState: { invalid, error } }) => (
              <TextField
                sx={{ flex: 1 }}
                label="Code book"
                error={invalid}
                helperText={error?.message}
                required
                {...field}
                slotProps={{
                  input: {
                    sx: { textTransform: 'uppercase' },
                  },
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="description"
            defaultValue=""
            rules={{
              maxLength: {
                value: 500,
                message: 'Description must be less than 500 characters.',
              },
            }}
            render={({ field, fieldState: { invalid, error } }) => (
              <TextField
                multiline
                minRows={5}
                fullWidth
                label="Description"
                {...field}
                error={invalid}
                helperText={error?.message}
              />
            )}
          />
          <Stack gap={2} flexDirection={{ xs: 'column', md: 'row' }}>
            <Controller
              control={control}
              name="type"
              defaultValue="FIXED_AMOUNT"
              render={({ field, fieldState: { invalid, error } }) => (
                <TextField
                  fullWidth
                  sx={{ textTransform: 'capitalize' }}
                  select
                  label="Type"
                  required
                  {...field}
                  error={invalid}
                  helperText={error?.message}
                >
                  {TypePromotion.map((t) => (
                    <MenuItem value={t} sx={{ textTransform: 'capitalize' }}>
                      {t.toLocaleLowerCase().replace('_', ' ')}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              control={control}
              name="value"
              render={({ field, fieldState: { invalid, error } }) => (
                <TextField
                  disabled={type === 'FREE_SHIPPING'}
                  type="number"
                  label="Value"
                  required={type !== 'FREE_SHIPPING'}
                  {...field}
                  error={invalid}
                  helperText={error?.message}
                />
              )}
            />
          </Stack>
        </Stack>
      </Collapse>
    </Card>
  );
}
