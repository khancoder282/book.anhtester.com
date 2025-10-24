import { useEffect } from 'react';
import { useForm, useFormState } from 'react-hook-form';

import { Box, Link, Button, useTheme, Typography } from '@mui/material';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/config-global';
import { AuthLayout } from 'src/layouts/auth';

import Title from 'src/components/title';
import { Iconify } from 'src/components/iconify';

import { formControl } from './store/form';
import { handleRegisterUser } from './api/register';
import { ContentUser } from './components/content-user';

export default function SignUp() {
  const t = useTheme();
  const router = useRouter();
  const { isSubmitSuccessful } = useFormState({ control: formControl.control });
  const { reset } = useForm({ formControl: formControl.formControl });

  useEffect(() => {
    reset({ id: '' });
  }, [reset]);
  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({ id: '' });
      router.push('/sign-in');
    }
  }, [isSubmitSuccessful, reset, router]);

  return (
    <AuthLayout
      cssVars={{
        '--layout-auth-content-width': `${t.breakpoints.values.sm}px`,
      }}
    >
      <Title>{`Sign up - ${CONFIG.appName}`}</Title>
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
      <ContentUser isColumn isActive={false} isAvatar={false} />
      <Button
        size="large"
        variant="contained"
        color="inherit"
        startIcon={<Iconify icon="solar:user-plus-bold" />}
        sx={{ mt: 3, mb: -2, alignSelf: 'flex-end' }}
        onClick={formControl.handleSubmit(handleRegisterUser)}
      >
        Register
      </Button>
    </AuthLayout>
  );
}
