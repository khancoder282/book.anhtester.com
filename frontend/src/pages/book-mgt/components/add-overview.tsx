import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Controller, useFormState } from 'react-hook-form';

import {
  Box,
  Link,
  Stack,
  Switch,
  Button,
  Divider,
  Container,
  Typography,
  Breadcrumbs,
  FormControlLabel,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { renderFallback } from 'src/routes/components/fallback';

import { CONFIG } from 'src/config-global';
import { useTranslate } from 'src/locales';
import { DashboardContent } from 'src/layouts/dashboard';

import Title from 'src/components/title';
import { Iconify } from 'src/components/iconify';
import { dialog } from 'src/components/dialog-confirm/confirm';

import { getBook } from '../api/get-book';
import { CardDetail } from './card-detail';
import { CardProperty } from './card-property';
import { deleteBook } from '../api/delete-book';
import { CardPromotion } from './card-promotion';
import { handleCreateBook } from '../api/create-book';
import { handleUpdateBook } from '../api/modify-book';
import { reset, control, setFocus, getValues, handleSubmit } from '../stores/form-add';

export function AddOverview() {
  const { t } = useTranslate();
  const [search] = useSearchParams();
  const { isLoading, isSubmitSuccessful, isDirty, isSubmitted, errors } = useFormState({ control });
  const [loadingPage, setLoadingPage] = useState(true);
  const router = useRouter();
  const id = search.get('id');

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
      setLoadingPage(false);
      reset({
        name: '',
        description: '',
        status: 'AVAILABLE',
        categories: [],
        slug: '',
        price: '',
        picture: [],
      });
    } else {
      getBook(id)
        .then((res) => {
          reset(res);
        })
        .finally(() => setLoadingPage(false));
    }
  }, [id]);

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
      const query = search.get('query');
      if (query) {
        router.push(`/book-management?${query}`);
      } else router.push('/book-management');
    }
  }, [isSubmitSuccessful, router, search]);

  if (loadingPage) return renderFallback();

  return (
    <DashboardContent>
      <Title>
        {`${id ? t('book.form.modifyTitle') : t('book.form.createTitle')} - ${CONFIG.appName}`}
      </Title>
      <Stack spacing={2} mb={5}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {id ? t('book.form.modifyTitle') : t('book.form.createTitle')}
        </Typography>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} href="/book-management" color="textPrimary" variant="body2">
            {t('book.form.breadcrumb')}
          </Link>
          <Typography variant="body2">
            {id ? t('book.form.modifyTitle') : t('book.form.createTitle')}
          </Typography>
        </Breadcrumbs>
      </Stack>

      <Container maxWidth="md">
        <Stack spacing={4} component="form" noValidate>
          <CardDetail />
          <CardProperty />
          <CardPromotion />
          <Box display="flex" flexWrap="wrap" gap={2}>
            <Controller
              control={control}
              name="status"
              defaultValue="AVAILABLE"
              render={({ field }) => (
                <FormControlLabel
                  checked={field.value === 'AVAILABLE'}
                  onChange={(_, c) => field.onChange(c ? 'AVAILABLE' : 'UNAVAILABLE')}
                  control={<Switch />}
                  label={
                    field.value === 'AVAILABLE'
                      ? t('book.form.available')
                      : t('book.form.unavailable')
                  }
                  sx={{ ml: 2 }}
                />
              )}
            />

            <Button
              disabled={!isDirty || isLoading}
              sx={{ ml: 'auto' }}
              size="large"
              color="inherit"
              onClick={() => reset()}
            >
              {t('book.form.reset')}
            </Button>
            <Button
              size="large"
              loading={isLoading}
              disabled={!isDirty}
              variant="contained"
              color="inherit"
              onClick={handleSubmit(async (data) =>
                id ? await handleUpdateBook(id, data) : await handleCreateBook(data)
              )}
            >
              {id ? t('book.form.saveChanges') : t('book.form.createBook')}
            </Button>
          </Box>
          {id && (
            <Stack>
              <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />
              <Typography variant="body2" color="textSecondary">
                {t('book.form.deleteNote')}
              </Typography>
              <Button
                variant="outlined"
                sx={{ alignSelf: 'end' }}
                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                color="error"
                onClick={() =>
                  dialog.delete(
                    <>
                      {t('book.form.deleteConfirmBefore')} <b>{getValues('name')}</b>
                      {t('book.form.deleteConfirmAfter')}
                    </>,
                    () =>
                      deleteBook(id).then((ok) => {
                        if (ok) router.back('/book-management');
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
