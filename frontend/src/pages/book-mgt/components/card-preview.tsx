import { useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { Card, Stack, Divider, Collapse, TextField, CardHeader, IconButton } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';

import { control } from '../stores/form-add';

/** Giới hạn khớp API (`book-controller.ts`: previewTitle ≤ 191, previewContent ≤ MAX_PREVIEW_LENGTH). */
export const MAX_PREVIEW_TITLE = 191;
export const MAX_PREVIEW_CONTENT = 20_000;

/** Chương đọc thử (không bắt buộc): hiện trong trình "Đọc thử" ở trang chi tiết sách. */
export function CardPreview() {
  const { t } = useTranslate();
  const [expen, setExpen] = useState(true);
  const content = useWatch({ control, name: 'previewContent' }) ?? '';

  return (
    <Card data-testid="card-preview">
      <CardHeader
        title={t('bookstore.preview.title')}
        subheader={t('bookstore.preview.subheader')}
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
            name="previewTitle"
            defaultValue=""
            rules={{
              maxLength: {
                value: MAX_PREVIEW_TITLE,
                message: t('book.validation.maxLength', { max: MAX_PREVIEW_TITLE }),
              },
            }}
            render={({ field, fieldState: { invalid, error } }) => (
              <TextField
                fullWidth
                label={t('bookstore.preview.previewTitle')}
                placeholder={t('bookstore.preview.previewTitlePlaceholder')}
                {...field}
                value={field.value ?? ''}
                inputProps={{ 'data-testid': 'preview-title-input' }}
                error={invalid}
                helperText={error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="previewContent"
            defaultValue=""
            rules={{
              maxLength: {
                value: MAX_PREVIEW_CONTENT,
                message: t('book.validation.maxLength', { max: MAX_PREVIEW_CONTENT }),
              },
            }}
            render={({ field, fieldState: { invalid, error } }) => (
              <TextField
                fullWidth
                multiline
                minRows={6}
                maxRows={18}
                label={t('bookstore.preview.previewContent')}
                {...field}
                value={field.value ?? ''}
                inputProps={{ 'data-testid': 'preview-content-input' }}
                error={invalid}
                helperText={
                  error?.message ??
                  t('bookstore.preview.previewContentHelper', {
                    count: content.length,
                    max: MAX_PREVIEW_CONTENT,
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
