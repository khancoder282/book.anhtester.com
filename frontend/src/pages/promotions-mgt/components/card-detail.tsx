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

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';

import { control, TypePromotion } from '../hooks/form-control';

export function CardDetail() {
  const [expen, setExpen] = useState(true);
  const { t, lang } = useTranslate();
  // Chữ thường + CSS viết hoa từng từ chỉ hợp với tiếng Anh; tiếng Việt đã viết sẵn đúng hoa thường
  const typeTextTransform = lang === 'en' ? 'capitalize' : 'none';
  const [type] = useWatch({
    control,
    name: ['type'],
  });

  return (
    <Card>
      <CardHeader
        title={t('promotion.detail.title')}
        subheader={t('promotion.detail.subheader')}
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
              required: t('promotion.detail.nameRequired'),
              maxLength: {
                value: 100,
                message: t('promotion.detail.nameMax'),
              },
            }}
            render={({ field, fieldState: { invalid, error } }) => (
              <TextField
                fullWidth
                label={t('promotion.detail.name')}
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
              required: t('promotion.detail.codeRequired'),
              validate: (value) => value.length === 6 || t('promotion.detail.codeLength'),
            }}
            render={({ field, fieldState: { invalid, error } }) => (
              <TextField
                sx={{ flex: 1 }}
                label={t('promotion.detail.code')}
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
                message: t('promotion.detail.descriptionMax'),
              },
            }}
            render={({ field, fieldState: { invalid, error } }) => (
              <TextField
                multiline
                minRows={5}
                fullWidth
                label={t('promotion.detail.description')}
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
                  sx={{ textTransform: typeTextTransform }}
                  select
                  label={t('promotion.detail.type')}
                  required
                  {...field}
                  error={invalid}
                  helperText={error?.message}
                >
                  {TypePromotion.map((option) => (
                    <MenuItem value={option} sx={{ textTransform: typeTextTransform }}>
                      {t(`promotion.detail.typeOption.${option}`)}
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
                  label={t('promotion.detail.value')}
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
