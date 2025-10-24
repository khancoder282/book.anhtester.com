import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Controller, useFormState } from 'react-hook-form';

import { Box, Link, Button, TextField, Typography } from '@mui/material';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { axios } from 'src/api/axios';
import { useAuth } from 'src/store/auth';
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
        <Typography variant="h3">Sign in</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Don’t have an account?
          <Link component={RouterLink} href="/sign-up" variant="subtitle2" sx={{ ml: 0.5 }}>
            Get started
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
              message: 'Invalid email address',
            },
            required: 'Email is required.',
            maxLength: {
              value: 250,
              message: 'Email maximum length is 250 characters.',
            },
          }}
          render={({ field, fieldState: { invalid, error } }) => (
            <TextField
              {...field}
              required
              error={invalid}
              helperText={error?.message}
              fullWidth
              label="Email address"
              sx={{ mb: 3 }}
            />
          )}
        />
        <Controller
          control={formControl.control}
          name="password"
          defaultValue=""
          rules={{
            required: 'Password is required.',
            maxLength: {
              value: 250,
              message: 'Password maximum length is 250 characters.',
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
              label="Password"
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
          Login account
        </Button>
      </Box>
    </AuthLayout>
  );
}
