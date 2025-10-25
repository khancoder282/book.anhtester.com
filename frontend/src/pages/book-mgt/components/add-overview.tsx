import { useSearchParams } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
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
  const [search] = useSearchParams();
  const { isLoading, isSubmitSuccessful, isDirty, isSubmitted, errors } = useFormState({ control });
  const [loadingPage, setLoadingPage] = useState(true);
  const router = useRouter();
  const id = search.get('id');
  const rootName = useMemo(() => getValues('name'), []);

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
        {id ? `Modify book - ${CONFIG.appName}` : `Create a new book - ${CONFIG.appName}`}
      </Title>
      <Stack spacing={2} mb={5}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {id ? 'Modify book' : 'Create a new book'}
        </Typography>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} href="/book-management" color="textPrimary" variant="body2">
            Book management
          </Link>
          <Typography variant="body2">Create a new book</Typography>
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
                  label={field.value ? 'Available book' : 'Unavailable book'}
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
              Reset
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
              {id ? 'Save changes' : 'Create book'}
            </Button>
          </Box>
          {id && (
            <Stack>
              <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />
              <Typography variant="body2" color="textSecondary">
                This book, previously part of your business inventory, is no longer in active
                commerce and is now available for sale to interested buyers looking for a great
                deal.
              </Typography>
              <Button
                variant="outlined"
                sx={{ alignSelf: 'end' }}
                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                color="error"
                onClick={() =>
                  dialog.delete(
                    <>
                      Do you want delete <b>{rootName}</b>, after delete you can&apos;t undo
                    </>,
                    () =>
                      deleteBook(id).then(() => {
                        router.back('/book-management');
                      })
                  )
                }
              >
                Delete
              </Button>
            </Stack>
          )}
        </Stack>
      </Container>
    </DashboardContent>
  );
}
