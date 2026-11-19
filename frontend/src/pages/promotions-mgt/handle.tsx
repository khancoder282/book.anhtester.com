import dayjs from 'dayjs';
import { useEffect } from 'react';
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

import { useTranslate } from 'src/locales';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import Title from 'src/components/title';
import { Iconify } from 'src/components/iconify';
import { dialog } from 'src/components/dialog-confirm/confirm';

import { CardBook } from './components/card-book';
import { CardDetail } from './components/card-detail';
import { CardStatus } from './components/card-status';
import { deleteBook } from '../book-mgt/api/delete-book';
import { createPromotion } from './api/create-promotion';
import { reset, control, setFocus, getValues, handleSubmit } from './hooks/form-control';

export default function Handle() {
  const [s] = useSearchParams();
  const id = s.get('id');
  const rootName = getValues('name');
  const router = useRouter();
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
    if (isSubmitSuccessful) {
      reset();
      router.back('/promotion-book-management');
    }
  }, [isSubmitSuccessful, router]);

  return (
    <DashboardContent>
      <Title>
        {`${id ? t('promotion.handle.modifyTitle') : t('promotion.handle.createTitle')} - ${CONFIG.appName}`}
      </Title>
      <Stack spacing={2} mb={5}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {id ? t('promotion.handle.modifyTitle') : t('promotion.handle.createTitle')}
        </Typography>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            component={RouterLink}
            href="/promotion-book-management"
            color="textPrimary"
            variant="body2"
          >
            {t('promotion.handle.breadcrumb')}
          </Link>
          <Typography variant="body2">{t('promotion.handle.createTitle')}</Typography>
        </Breadcrumbs>
      </Stack>
      <Container maxWidth="md">
        <Stack spacing={4} component="form" noValidate onSubmit={handleSubmit(createPromotion)}>
          <CardDetail />
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
              color="inherit"
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
                      <b>{rootName}</b>
                      {t('promotion.handle.deleteConfirmAfter')}
                    </>,
                    () =>
                      deleteBook(id).then(() => {
                        router.back('/book-management');
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
