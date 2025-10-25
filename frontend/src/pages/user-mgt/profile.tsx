import { useEffect } from 'react';
import { useFormState } from 'react-hook-form';

import { Box, Card, Link, Stack, Button, Typography, Breadcrumbs } from '@mui/material';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { axios } from 'src/api/axios';
import { useAuth } from 'src/store/auth';
import { CONFIG } from 'src/config-global';
import { hanldeLogout } from 'src/api/logout';
import { DashboardContent } from 'src/layouts/dashboard';

import Title from 'src/components/title';
import { toast } from 'src/components/toast';
import { Iconify } from 'src/components/iconify';

import { formControl } from './store/form';
import { ContentUser } from './components/content-user';
import { handleUpdateProfileUser } from './api/profile';

export default function Profile() {
  const { auth, setAuth } = useAuth();
  const router = useRouter();
  const { isDirty, isSubmitSuccessful, isLoading } = useFormState({ control: formControl.control });
  useEffect(() => {
    if (auth) {
      formControl.reset({
        ...auth,
        avatar: {
          path: auth.avatarUrl,
        } as FileItem,
      });
    } else {
      toast.error('Please login first', { id: 'msg' });
      router.push('/sign-in');
    }
  }, [auth, router]);

  useEffect(() => {
    if (isSubmitSuccessful) {
      const value = formControl.getValues();
      if (auth?.email !== value.email || value.password) {
        formControl.reset();
        hanldeLogout().then(()=>{
          setAuth(null);
          router.push('/sign-in');
        })
      } else {
        axios.get('/me').then((res) => {
          setAuth(res.data);
          formControl.reset(res.data);
        });
      }
    }
  }, [auth?.email, isSubmitSuccessful, router, setAuth]);

  return (
    <DashboardContent>
      <Title>{`My profile - ${CONFIG.appName}`}</Title>
      <Stack spacing={2} mb={5}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          My Profile
        </Typography>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} href="/user-management" color="textPrimary" variant="body2">
            User management
          </Link>
          <Typography variant="body2">Change my profile</Typography>
        </Breadcrumbs>
      </Stack>
      <Card sx={{ p: 3, pt: 4, display: 'flex', flexDirection: 'column' }}>
        <ContentUser isActive={false} oldPassword />
        <Box display="flex" justifyContent="end" mt={3} gap={2}>
          <Button
            size="large"
            color="inherit"
            disabled={!isDirty}
            onClick={() => formControl.reset()}
          >
            Reset
          </Button>
          <Button
            size="large"
            color="inherit"
            variant="contained"
            loading={isLoading}
            startIcon={<Iconify icon="solar:diskette-bold" />}
            onClick={formControl.handleSubmit(handleUpdateProfileUser)}
            disabled={!isDirty}
          >
            Save Profile
          </Button>
        </Box>
      </Card>
    </DashboardContent>
  );
}
