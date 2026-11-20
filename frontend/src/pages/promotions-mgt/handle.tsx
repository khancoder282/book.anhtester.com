import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWatch, Controller, useFormState } from 'react-hook-form';

import {
  Box,
  Link,
  Stack,
  Button,
  Switch,
  Divider,
  Container,
  Typography,
  Breadcrumbs,
  FormControlLabel,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { useAuthCheck } from 'src/routes/hooks/use-auth-check';
import { renderFallback } from 'src/routes/components/fallback';

import { useTranslate } from 'src/locales';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import Title from 'src/components/title';
import { Iconify } from 'src/components/iconify';
import { dialog } from 'src/components/dialog-confirm/confirm';
import { PageHeader } from 'src/components/page-header/page-header';

import { CardBook } from './components/card-book';
import { CardDetail } from './components/card-detail';
import { CardStatus } from './components/card-status';
import { createPromotion } from './api/create-promotion';
import { updatePromotion } from './api/update-promotion';
import { deletePromotion } from './api/delete-promotion';
import { getPromotionDetail } from './api/get-promotion-detail';
import {
  reset,
  control,
  setFocus,
  getValues,
  handleSubmit,
  type PromotionForm,
} from './hooks/form-control';

const emptyPromotion = (): PromotionForm => ({
  name: '',
  code: '',
  description: '',
  type: 'FIXED_AMOUNT',
  value: '',
  startDate: dayjs(),
  endDate: dayjs().add(7, 'day'),
  isActive: true,
  books: [],
});

export default function Handle() {
  const [s] = useSearchParams();
  const id = s.get('id');
  const router = useRouter();
  const [loading, setLoading] = useState(!!id);
  // Mã cũ của khuyến mãi đang sửa: được giữ nguyên dù không đủ 6 ký tự (dữ liệu mẫu có mã dài hơn)
  const [originalCode, setOriginalCode] = useState<string>();
  const { t } = useTranslate();
  const [endDate] = useWatch({ control, name: ['endDate'] });
  const { isSubmitted, errors, isSubmitSuccessful } = useFormState({ control });
  useAuthCheck();
  useEffect(() => {
    if (isSubmitted) {
      const err = Object.keys(errors)[0];
      if (err) {
        setFocus(err as any);
        const errorElement = document.querySelector(`[name="${err}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });
        }
      }
    }
  }, [errors, isSubmitted]);

  useEffect(() => {
    if (!id) {
      setOriginalCode(undefined);
      reset(emptyPromotion());
      setLoading(false);
      return;
    }
    setLoading(true);
    getPromotionDetail(id)
      .then((data) => {
        reset(data);
        setOriginalCode(data.code);
      })
      .catch(() => router.push('/promotion-book-management'))
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
      router.back('/promotion-book-management');
    }
  }, [isSubmitSuccessful, router]);

  if (loading) return renderFallback();

  return (
    <DashboardContent>
      <Title>
        {`${id ? t('promotion.handle.modifyTitle') : t('promotion.handle.createTitle')} - ${CONFIG.appName}`}
      </Title>
      <PageHeader
        icon="ph:seal-percent-fill"
        tone="orange"
        title={id ? t('promotion.handle.modifyTitle') : t('promotion.handle.createTitle')}
      >
        <Breadcrumbs sx={{ mt: 0.5 }}>
          <Link
            component={RouterLink}
            href="/promotion-book-management"
            color="textPrimary"
            variant="body2"
          >
            {t('promotion.handle.breadcrumb')}
          </Link>
          <Typography variant="body2">
            {id ? t('promotion.handle.modifyTitle') : t('promotion.handle.createTitle')}
          </Typography>
        </Breadcrumbs>
      </PageHeader>
      <Container maxWidth="md">
        <Stack
          spacing={4}
          component="form"
          noValidate
          onSubmit={handleSubmit((data) =>
            id ? updatePromotion(id, data) : createPromotion(data)
          )}
        >
          <CardDetail originalCode={originalCode} />
          <CardStatus />
          <CardBook />
          <Box display="flex" flexWrap="wrap" gap={2}>
            {endDate > dayjs() && (
              <Controller
                control={control}
                name="isActive"
                defaultValue
                render={({ field }) => (
                  <FormControlLabel
                    checked={field.value}
                    onChange={(_, c) => field.onChange(c)}
                    control={<Switch />}
                    label={
                      field.value ? t('promotion.handle.active') : t('promotion.handle.inactive')
                    }
                    sx={{ ml: 2 }}
                  />
                )}
              />
            )}

            <Button
              //   disabled={!isDirty || isLoading}
              sx={{ ml: 'auto' }}
              size="large"
              color="inherit"
              onClick={() => reset()}
            >
              {t('promotion.handle.reset')}
            </Button>
            <Button
              size="large"
              //   loading={isLoading}
              //   disabled={!isDirty}
              variant="contained"
              color="secondary"
              type="submit"
            >
              {id ? t('promotion.handle.saveChanges') : t('promotion.handle.create')}
            </Button>
          </Box>
          {id && (
            <Stack>
              <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />
              <Typography variant="body2" color="textSecondary">
                {t('promotion.handle.deleteNote')}
              </Typography>
              <Button
                variant="outlined"
                sx={{ alignSelf: 'end' }}
                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                color="error"
                onClick={() =>
                  dialog.delete(
                    <>
                      {t('promotion.handle.deleteConfirmBefore')}
                      <b>{getValues('name')}</b>
                      {t('promotion.handle.deleteConfirmAfter')}
                    </>,
                    () =>
                      deletePromotion(id).then((ok) => {
                        if (ok) router.push('/promotion-book-management');
                      })
                  )
                }
              >
                {t('common.actions.delete')}
              </Button>
            </Stack>
          )}
        </Stack>
      </Container>
    </DashboardContent>
  );
}
