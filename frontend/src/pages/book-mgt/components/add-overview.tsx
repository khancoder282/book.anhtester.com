import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Controller, useFormState } from 'react-hook-form';

import {
  Box,
  Link,
  Stack,
  Switch,
  Button,
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

import { getBook } from '../api/get-book';
import { CardDetail } from './card-detail';
import { CardProperty } from './card-property';
import { CardPromotion } from './card-promotion';
import { handleCreateBook } from '../api/create-book';
import { reset, control, handleSubmit } from '../stores/form-add';

export function AddOverview() {
  const [search] = useSearchParams();
  const { isLoading, isSubmitSuccessful } = useFormState({ control });
  const [loadingPage, setLoadingPage] = useState(true);
  const router = useRouter();
  const id = search.get('id');

  useEffect(() => {
    if (!id) {
      setLoadingPage(false);
      reset({
        name: '',
        description: '',
        status: 'AVAILABLE',
        categories: [],
        slug: '',
        price: 0,
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
      router.push('/book-management');
    }
  }, [isSubmitSuccessful, router]);

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
        <Stack spacing={4}>
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
              sx={{ ml: 'auto' }}
              size="large"
              disabled={isLoading}
              variant="contained"
              color="inherit"
              onClick={handleSubmit(handleCreateBook)}
            >
              {id ? 'Save changes' : 'Create book'}
            </Button>
          </Box>
        </Stack>
      </Container>
    </DashboardContent>
  );
}
