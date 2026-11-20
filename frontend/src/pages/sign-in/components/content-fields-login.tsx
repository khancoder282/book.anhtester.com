import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Controller, useFormState } from 'react-hook-form';

import { Box, Link, Button, TextField, Typography } from '@mui/material';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { textFieldTestId } from 'src/utils/test-id';

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
  const { setAuth, setChecked } = useAuth();
  const router = useRouter();
  const { t } = useTranslate();

  useEffect(() => {
    if (isSubmitSuccessful) {
      axios.get('/me').then((res) => {
        setAuth(res.data);
        setChecked(true);
        formControl.reset();
      });
      router.replace(redirect ?? '/');
    }
  }, [isSubmitSuccessful, redirect, router, setAuth, setChecked]);

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
        <Typography variant="h3" data-testid="login-title">
          {t('auth.signIn.title')}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          {t('auth.signIn.noAccount')}
          <Link
            component={RouterLink}
            href="/sign-up"
            id="login-sign-up-link"
            data-testid="login-sign-up-link"
            variant="subtitle2"
            sx={{ ml: 0.5 }}
          >
            {t('auth.signIn.getStarted')}
          </Link>
        </Typography>
      </Box>
      <Box
        component="form"
        id="login-form"
        data-testid="login-form"
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
              value: 191,
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
              id="login-email"
              autoComplete="email"
              slotProps={textFieldTestId('login-email')}
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
              id="login-password"
              autoComplete="current-password"
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
          id="login-submit"
          data-testid="login-submit"
          color="secondary"
          variant="contained"
          sx={{ mb: -2 }}
        >
          {t('auth.signIn.submit')}
        </Button>
      </Box>
    </AuthLayout>
  );
}
