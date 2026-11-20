import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/config-global';
import { useTranslate } from 'src/locales';
import { AuthLayout } from 'src/layouts/auth';

import Title from 'src/components/title';
import { Iconify } from 'src/components/iconify';

import { HelpContent } from './help-content';

// ----------------------------------------------------------------------

/** `/help`: trang liên hệ cho người chưa đăng nhập (link "Need help?" ở màn đăng nhập / đăng ký). */
export default function HelpPage() {
  const { t } = useTranslate();

  return (
    <AuthLayout cssVars={{ '--layout-auth-content-width': '560px' }}>
      <Title>{`${t('help.title')} - ${CONFIG.appName}`}</Title>

      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 1.5 }}>
          {t('help.title')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('help.description')}
        </Typography>
      </Box>

      <HelpContent />

      <Button
        component={RouterLink}
        href="/sign-in"
        size="large"
        variant="contained"
        color="inherit"
        startIcon={<Iconify icon="solar:arrow-left-linear" />}
        data-testid="help-back-to-sign-in"
        sx={{ mt: 4 }}
      >
        {t('help.backToSignIn')}
      </Button>
    </AuthLayout>
  );
}
