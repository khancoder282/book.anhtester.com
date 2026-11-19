import { useEffect } from 'react';
import { useFormState } from 'react-hook-form';

import { Box, Card, Link, Stack, Button, Typography, Breadcrumbs } from '@mui/material';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { useAuthCheck } from 'src/routes/hooks/use-auth-check';

import { axios } from 'src/api/axios';
import { useAuth } from 'src/store/auth';
import { useTranslate } from 'src/locales';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import Title from 'src/components/title';
import { Iconify } from 'src/components/iconify';

import { formControl } from './store/form';
import { ContentUser } from './components/content-user';
import { handleUpdateProfileUser } from './api/profile';

export default function Profile() {
  const { auth, setAuth } = useAuth();
  const router = useRouter();
  const { t } = useTranslate();
  const { isDirty, isSubmitSuccessful, isLoading } = useFormState({ control: formControl.control });
  // Chưa đăng nhập thì chuyển sang Sign in (chờ /me tải xong rồi mới quyết định)
  useAuthCheck();

  useEffect(() => {
    if (auth) {
      formControl.reset({
        ...auth,
        avatar: {
          path: auth.avatarUrl,
        } as FileItem,
      });
    }
  }, [auth]);

  useEffect(() => {
    if (isSubmitSuccessful) {
      const value = formControl.getValues();
      if (auth?.email !== value.email || value.password) {
        // Đổi email / mật khẩu: backend đã thu hồi mọi phiên, chỉ cần dọn phía client
        formControl.reset();
        localStorage.removeItem('accessToken');
        setAuth(null);
        router.push('/sign-in');
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
      <Title>{`${t('user.profile.pageTitle')} - ${CONFIG.appName}`}</Title>
      <Stack spacing={2} mb={5}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {t('user.profile.title')}
        </Typography>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} href="/user-management" color="textPrimary" variant="body2">
            {t('user.breadcrumb.userManagement')}
          </Link>
          <Typography variant="body2">{t('user.profile.breadcrumb')}</Typography>
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
            {t('user.profile.reset')}
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
            {t('user.profile.save')}
          </Button>
        </Box>
      </Card>
    </DashboardContent>
  );
}
