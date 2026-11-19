import { useState } from 'react';
import { Controller } from 'react-hook-form';

import { Card, Grid, Divider, Collapse, TextField, CardHeader, IconButton } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';

import { control } from '../stores/form-add';

/** Giới hạn khớp API (`backend/src/routers/book-controller.ts`, `bookExtraSchemas`). */
const MIN_PUBLISH_YEAR = 1000;
const MAX_PAGE_COUNT = 100_000;

const isBlank = (v: unknown) => v === '' || v === null || v === undefined;

/** Thông tin thêm của sách — mọi ô đều không bắt buộc. */
export function CardMoreInfo() {
  const { t } = useTranslate();
  const [expen, setExpen] = useState(true);
  const currentYear = new Date().getFullYear();

  const textField = (
    name: 'author' | 'publisher' | 'language',
    maxLength: number,
    placeholder?: string
  ) => (
    <Controller
      control={control}
      name={name}
      defaultValue=""
      rules={{
        maxLength: {
          value: maxLength,
          message: t('book.validation.maxLength', { max: maxLength }),
        },
      }}
      render={({ field, fieldState: { invalid, error } }) => (
        <TextField
          fullWidth
          label={t(`book.moreInfo.${name}`)}
          placeholder={placeholder}
          {...field}
          value={field.value ?? ''}
          error={invalid}
          helperText={error?.message}
        />
      )}
    />
  );

  return (
    <Card>
      <CardHeader
        title={t('book.moreInfo.title')}
        subheader={t('book.moreInfo.subheader')}
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
        <Grid container spacing={3} p={3}>
          <Grid size={{ xs: 12, sm: 6 }}>{textField('author', 191)}</Grid>
          <Grid size={{ xs: 12, sm: 6 }}>{textField('publisher', 191)}</Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              control={control}
              name="publishYear"
              defaultValue=""
              rules={{
                validate: (v) => {
                  if (isBlank(v)) return true;
                  const n = Number(v);
                  if (!Number.isInteger(n)) return t('book.validation.integer');
                  if (n < MIN_PUBLISH_YEAR || n > currentYear) {
                    return t('book.validation.publishYearRange', {
                      min: MIN_PUBLISH_YEAR,
                      max: currentYear,
                    });
                  }
                  return true;
                },
              }}
              render={({ field, fieldState: { invalid, error } }) => (
                <TextField
                  fullWidth
                  type="number"
                  label={t('book.moreInfo.publishYear')}
                  {...field}
                  value={field.value ?? ''}
                  error={invalid}
                  helperText={error?.message}
                  slotProps={{ htmlInput: { min: MIN_PUBLISH_YEAR, max: currentYear, step: 1 } }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              control={control}
              name="pageCount"
              defaultValue=""
              rules={{
                validate: (v) => {
                  if (isBlank(v)) return true;
                  const n = Number(v);
                  if (!Number.isInteger(n)) return t('book.validation.integer');
                  if (n < 1 || n > MAX_PAGE_COUNT) {
                    return t('book.validation.pageCountRange', { max: MAX_PAGE_COUNT });
                  }
                  return true;
                },
              }}
              render={({ field, fieldState: { invalid, error } }) => (
                <TextField
                  fullWidth
                  type="number"
                  label={t('book.moreInfo.pageCount')}
                  {...field}
                  value={field.value ?? ''}
                  error={invalid}
                  helperText={error?.message}
                  slotProps={{ htmlInput: { min: 1, max: MAX_PAGE_COUNT, step: 1 } }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              control={control}
              name="isbn"
              defaultValue=""
              rules={{
                validate: (v) => {
                  if (isBlank(v)) return true;
                  const isbn = String(v).replace(/[\s-]/g, '').toUpperCase();
                  // Kiểm tra định dạng; chữ số kiểm tra (check digit) do API kiểm
                  return /^(\d{9}[\dX]|\d{13})$/.test(isbn) || t('book.validation.isbn');
                },
              }}
              render={({ field, fieldState: { invalid, error } }) => (
                <TextField
                  fullWidth
                  label={t('book.moreInfo.isbn')}
                  placeholder="978-604-1-23456-7"
                  {...field}
                  value={field.value ?? ''}
                  error={invalid}
                  helperText={error?.message || t('book.moreInfo.isbnHelper')}
                  slotProps={{ htmlInput: { maxLength: 20 } }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>{textField('language', 50)}</Grid>
        </Grid>
      </Collapse>
    </Card>
  );
}
