import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormState } from 'react-hook-form';

import { Box, Link, Button, Typography } from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { AuthLayout } from 'src/layouts/auth';

import { registerHanlde } from '../api/login';
import { ContentFields } from './content-fields';
import { formControl } from '../store/store-fields-register';

export function ContentFieldsRegister() {
  const { isLoading, isSubmitSuccessful } = useFormState({ control: formControl.control });
  const navigate = useNavigate();
  useEffect(() => {
    if (isSubmitSuccessful) {
      navigate('/sign-in');
      formControl.reset();
    }
  }, [isSubmitSuccessful, navigate]);
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
        <Typography variant="h3">Sign up</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Already have an account?
          <Link component={RouterLink} href="/sign-in" variant="subtitle2" sx={{ ml: 0.5 }}>
            Sign in
          </Link>
        </Typography>
      </Box>
      <Box
        component="form"
        noValidate
        onSubmit={formControl.handleSubmit(registerHanlde)}
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          flexDirection: 'column',
        }}
      >
        <ContentFields />
        <Button
          loading={isLoading}
          fullWidth
          size="large"
          type="submit"
          color="inherit"
          variant="contained"
        >
          Register
        </Button>
      </Box>
    </AuthLayout>
  );
}
