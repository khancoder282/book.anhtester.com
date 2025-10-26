import { useState, useEffect } from 'react';
import { useWatch, Controller } from 'react-hook-form';

import {
  Box,
  Card,
  Stack,
  Button,
  Divider,
  Collapse,
  Checkbox,
  TextField,
  CardHeader,
  IconButton,
  Typography,
  InputAdornment,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { accepImg, UploadField } from 'src/components/fields/upload-field';

import { slugify } from '../api/create-book';
import { control, setValue } from '../stores/form-add';

export function CardDetail() {
  const [expen, setExpen] = useState(true);
  const [isChangeSlug, setIsChangeSlug] = useState(false);
  const [name] = useWatch({ control, name: ['name'] });
  const [pictureDel = []] = useWatch({ control, name: ['pictureDel', 'picture'] });
  const setPictureDel = (value: FileItem[]) => setValue('pictureDel', value);

  useEffect(() => {
    setValue('slug', slugify(name || ''));
  }, [name]);

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
              deps: ['slug'],
            }}
            render={({ field, fieldState: { invalid, error } }) => (
              <TextField
                fullWidth
                label="Book name"
                {...field}
                error={invalid}
                helperText={error?.message}
                required
              />
            )}
          />
          <Controller
            name="slug"
            control={control}
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
                disabled={!isChangeSlug}
                sx={{ flex: 1 }}
                label="Slug name book"
                error={invalid}
                helperText={error?.message}
                {...field}
                required
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="outlined"
                          color="inherit"
                          size="small"
                          onClick={() => setIsChangeSlug(!isChangeSlug)}
                          startIcon={
                            <Checkbox checked={isChangeSlug} color="inherit" sx={{ p: 0 }} />
                          }
                        >
                          Change
                        </Button>
                      </InputAdornment>
                    ),
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
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">
              Picture{' '}
              <Box component="span" sx={{ color: 'primary.main' }}>
                *
              </Box>
            </Typography>
            <Controller
              control={control}
              name="picture"
              defaultValue={[]}
              rules={{
                validate: {
                  maxFileSize: (files) =>
                    files.every((file) => file.size < 1024 * 1024 * 5) ||
                    'File size must be less than 5MB',
                  maxLength: (files) => files.length <= 30 || 'You can upload up to 30 files',
                  minLength: (files) => files.length >= 1 || 'You must upload at least 1 file',
                },
              }}
              render={({ field, fieldState: { invalid, error } }) => (
                <>
                  <UploadField
                    viewMode="grid"
                    showMode
                    {...field}
                    delFiles={pictureDel}
                    setDelFiles={setPictureDel}
                    error={invalid}
                    helperText={error?.message}
                    opt={{
                      multiple: true,
                      accept: accepImg,
                    }}
                  />
                  {field.value.length > 0 && (
                    <Button
                      size="small"
                      color="inherit"
                      variant="outlined"
                      sx={{ mt: 1, alignSelf: 'flex-end' }}
                      onClick={() => field.onChange([])}
                    >
                      Remove all
                    </Button>
                  )}
                </>
              )}
            />
          </Stack>
        </Stack>
      </Collapse>
    </Card>
  );
}
