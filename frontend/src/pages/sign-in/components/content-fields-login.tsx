import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Controller, useFormState } from 'react-hook-form';

import { Box, Link, Button, TextField, Typography } from '@mui/material';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { axios } from 'src/api/axios';
import { useAuth } from 'src/store/auth';
import { useTranslate } from 'src/locales';
import { AuthLayout } from 'src/layouts/auth';

import { PasswordField } from 'src/components/fields/password-field';

import { loginHanle } from '../api/login';
import { formControl } from '../store/store-fields-login';

export function ContentFieldsLogin() {
  const { isLoading, isSubmitSuccessful } = useFormState({ control: formControl.control });
  const [search] = useSearchParams();
  const redirect = search.get('redirect');
  const { setAuth } = useAuth();
  const router = useRouter();
  const { t } = useTranslate();

  useEffect(() => {
    if (isSubmitSuccessful) {
      axios.get('/api/me').then((res) => {
        setAuth(res.data);
        formControl.reset();
      });
      router.replace(redirect ?? '/');
    }
  }, [isSubmitSuccessful, redirect, router, setAuth]);

  return (
    <AuthLayout>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h3">{t('auth.signIn.title')}</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          {t('auth.signIn.noAccount')}
          <Link component={RouterLink} href="/sign-up" variant="subtitle2" sx={{ ml: 0.5 }}>
            {t('auth.signIn.getStarted')}
          </Link>
        </Typography>
      </Box>
      <Box
        component="form"
        noValidate
        onSubmit={formControl.handleSubmit(loginHanle)}
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          flexDirection: 'column',
        }}
      >
        <Controller
          control={formControl.control}
          name="email"
          defaultValue=""
          rules={{
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: t('auth.validation.emailInvalid'),
            },
            required: t('auth.validation.emailRequired'),
            maxLength: {
              value: 250,
              message: t('auth.validation.emailMaxLength'),
            },
          }}
          render={({ field, fieldState: { invalid, error } }) => (
            <TextField
              {...field}
              required
              error={invalid}
              helperText={error?.message}
              fullWidth
              label={t('auth.signIn.emailLabel')}
              sx={{ mb: 3 }}
            />
          )}
        />
        <Controller
          control={formControl.control}
          name="password"
          defaultValue=""
          rules={{
            required: t('auth.validation.passwordRequired'),
            maxLength: {
              value: 250,
              message: t('auth.validation.passwordMaxLength'),
            },
          }}
          render={({ field, fieldState: { invalid, error } }) => (
            <PasswordField
              {...field}
              required
              fullWidth
              error={invalid}
              helperText={error?.message}
              name="password"
              label={t('auth.signIn.passwordLabel')}
              sx={{ mb: 3 }}
            />
          )}
        />

        <Button
          loading={isLoading}
          fullWidth
          size="large"
          type="submit"
          color="inherit"
          variant="contained"
          sx={{ mb: -2 }}
        >
          {t('auth.signIn.submit')}
        </Button>
      </Box>
    </AuthLayout>
  );
}
