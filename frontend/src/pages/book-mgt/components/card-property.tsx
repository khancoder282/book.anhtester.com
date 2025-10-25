import { useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';

import {
  Card,
  Chip,
  Stack,
  Avatar,
  Divider,
  Collapse,
  TextField,
  CardHeader,
  IconButton,
  Autocomplete,
  InputAdornment,
} from '@mui/material';

import { useRequest } from 'src/hooks/use-request';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { Category } from '../api/categorys';
import { control } from '../stores/form-add';

export function CardProperty() {
  const [expen, setExpen] = useState(true);
  const { data = [] } = useRequest(() => Category.get());
  const mapCategory = data.reduce(
    (acc, cur) => {
      acc[cur.name] = cur;
      return acc;
    },
    {} as Record<string, Categories>
  );

  const sortedCategoryNames = useMemo(
    () => (data ? [...data].sort((a, b) => a.bookCount - b.bookCount).map((c) => c.name) : []),
    [data]
  );

  return (
    <Card>
      <CardHeader
        title="Property"
        subheader="Category, price"
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
            name="price"
            rules={{
              required: 'Price is required.',
              min: { value: 1000, message: 'Price must be greater than 1000 VNĐ.' },
              max: { value: 100_000_000_000, message: 'Price must be less than 1 billion VNĐ.' },
              pattern: {
                value: /^\d*\.?\d*$/,
                message: 'Price must be a number.',
              },
            }}
            defaultValue=""
            render={({ field, fieldState: { invalid, error } }) => (
              <TextField
                fullWidth
                label="Regular price"
                {...field}
                type="number"
                error={invalid}
                helperText={
                  error?.message ||
                  new Intl.NumberFormat('vi-VN').format(Number(field.value)) + ' VNĐ'
                }
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Label>VNĐ</Label>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />

          <Controller
            control={control}
            name="categories"
            rules={{
              validate: {
                minLength: (val) => (val?.length > 0 || 'Please select at least one category'),
                itemMaxLength: (val) =>
                  val?.every((c) => (typeof c === 'string' ? c.length : mapCategory[c]?.name.length) < 25) ||
                  'Each category name must be less than 25 characters',
              },
            }}
            defaultValue={[]}
            render={({ field, fieldState: { invalid, error } }) => (
              <Autocomplete
                multiple
                freeSolo
                openOnFocus
                disablePortal
                filterSelectedOptions
                options={sortedCategoryNames}
                getOptionLabel={(option) => (typeof option === 'string' ? option : '')}
                isOptionEqualToValue={(option, value) => option === value}
                {...field}
                value={Array.isArray(field.value) ? field.value : []}
                onChange={(_, newValue) => field.onChange(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Categories"
                    error={invalid}
                    helperText={error?.message}
                    required
                  />
                )}
                renderOption={(props, option) => {
                  const count = mapCategory[option]?.bookCount ?? 0;
                  return (
                    <li {...props} key={option}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          color: '#fff',
                          fontWeight: 600,
                          width: 24,
                          height: 24,
                          fontSize: 14,
                          mr: 1,
                        }}
                      >
                        {count}
                      </Avatar>
                      {option}
                    </li>
                  );
                }}
                renderTags={(tags, get) =>
                  tags.map((t, index) => {
                    const props = get({ index });
                    const tag = mapCategory[t];

                    return (
                      <Chip
                        {...props}
                        key={props.key}
                        label={
                          <Stack direction="row" alignItems="center">
                            <Label
                              sx={{
                                ml: -1,
                                mr: 0.5,
                                borderRadius: 1,
                                bgcolor: tag ? 'primary.main' : `warning.main`,
                                color: '#fff !important',
                              }}
                            >
                              {tag ? tag.bookCount : <Iconify width={16} icon="solar:star-bold" />}
                            </Label>
                            {t}
                          </Stack>
                        }
                      />
                    );
                  })
                }
              />
            )}
          />
        </Stack>
      </Collapse>
    </Card>
  );
}
