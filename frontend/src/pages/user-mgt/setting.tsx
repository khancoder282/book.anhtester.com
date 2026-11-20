import { useEffect } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';

import * as colors from '@mui/material/colors';
import {
  Tab,
  Box,
  Link,
  Card,
  Tabs,
  Stack,
  Button,
  Typography,
  CardHeader,
  Breadcrumbs,
  CardContent,
  useColorScheme,
} from '@mui/material';

import { RouterLink } from 'src/routes/components';
import { useAuthCheck } from 'src/routes/hooks/use-auth-check';

import { useThemeData } from 'src/hooks/use-theme-data';

import { axios } from 'src/api/axios';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { type TKey, translate, useTranslate } from 'src/locales';

import Title from 'src/components/title';
import { toast } from 'src/components/toast';
import { Iconify, type IconifyName } from 'src/components/iconify';
import { PageHeader } from 'src/components/page-header/page-header';

const tabsTheme: { key: string; label: TKey; icon: IconifyName }[] = [
  {
    key: 'light',
    label: 'user.setting.themeLight',
    icon: 'solar:sun-bold',
  },
  {
    key: 'dark',
    label: 'user.setting.themeDark',
    icon: 'solar:moon-bold',
  },
  {
    key: 'system',
    label: 'user.setting.themeSystem',
    icon: 'solar:laptop-outline',
  },
];

export default function Setting() {
  const { setMode, mode } = useColorScheme();
  const { setPrimary, primary } = useThemeData();
  const { t } = useTranslate();
  const form = useForm<{ theme: 'light' | 'dark' | 'system'; mainColor: string }>({
    defaultValues: {
      theme: mode,
      mainColor: primary,
    },
  });
  const [theme, mainColor = '#42BC40'] = useWatch({
    control: form.control,
    name: ['theme', 'mainColor'],
  });

  useAuthCheck();

  useEffect(() => {
    setMode(theme);
    setPrimary(mainColor);
  }, [mainColor, setMode, setPrimary, theme]);

  const colorData = Object.entries(colors).filter((x) => x[0] !== 'common');
  return (
    <DashboardContent>
      <Title>{`${t('user.setting.title')} - ${CONFIG.appName}`}</Title>
      <PageHeader icon="solar:settings-bold-duotone" tone="slate" title={t('user.setting.title')}>
        <Breadcrumbs sx={{ mt: 0.5 }}>
          <Link
            data-testid="setting-breadcrumb-users"
            component={RouterLink}
            href="/user-management"
            color="textPrimary"
            variant="body2"
          >
            {t('user.breadcrumb.userManagement')}
          </Link>
          <Typography variant="body2">{t('user.setting.title')}</Typography>
        </Breadcrumbs>
      </PageHeader>
      <Stack spacing={3}>
        <Card>
          <CardHeader
            title={t('user.setting.themeTitle')}
            subheader={t('user.setting.themeSubheader')}
          />
          <CardContent>
            <Controller
              control={form.control}
              name="theme"
              defaultValue="system"
              render={({ field }) => (
                <Tabs
                  data-testid="setting-theme-tabs"
                  sx={{ borderRadius: 1, width: 'fit-content' }}
                  type="button"
                  value={field.value}
                  onChange={(_, v) => field.onChange(v)}
                >
                  {tabsTheme.map((tab) => (
                    <Tab
                      key={tab.key}
                      data-testid={`setting-theme-${tab.key}`}
                      label={t(tab.label)}
                      value={tab.key}
                      iconPosition="start"
                      icon={<Iconify icon={tab.icon} />}
                    />
                  ))}
                </Tabs>
              )}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader
            title={t('user.setting.colorTitle')}
            subheader={t('user.setting.colorSubheader')}
          />
          <CardContent>
            <Controller
              control={form.control}
              name="mainColor"
              render={({ field }) => (
                <Stack
                  direction="row"
                  sx={{
                    '&> *': {
                      flex: `0 0 ${100 / colorData.length}%`,
                    },
                  }}
                >
                  {colorData.map(([key, value]) => (
                    <Stack key={key}>
                      {Object.entries(value)
                        .filter(([x]) => Number(x) >= 300 && Number(x) <= 900)
                        .map(([shade, color]) => (
                          <Box
                            key={color}
                            data-testid={`setting-color-${key}-${shade}`}
                            sx={{
                              aspectRatio: '1 / 1',
                              bgcolor: color,
                              '&:hover': { opacity: 0.72 },
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: (muiTheme) => muiTheme.palette.getContrastText(color),
                              borderRadius: 3,
                              scale: 0.6,
                              transition: 'all 0.1s',
                              boxShadow: `2px 4px 8px 0 ${color}`,
                              ...(color === mainColor && { scale: 0.8 }),
                            }}
                            onClick={() => field.onChange(color)}
                          >
                            {mainColor === color && (
                              <Iconify width={0.6} icon="eva:checkmark-fill" />
                            )}
                          </Box>
                        ))}
                    </Stack>
                  ))}
                </Stack>
              )}
            />
          </CardContent>
        </Card>
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            data-testid="setting-reset"
            size="large"
            color="inherit"
            onClick={() => {
              form.reset();
            }}
          >
            {t('user.setting.reset')}
          </Button>
          <Button
            data-testid="setting-save"
            startIcon={<Iconify icon="solar:diskette-bold" />}
            size="large"
            color="inherit"
            variant="contained"
            onClick={form.handleSubmit(async (config) => {
              await axios
                .patch(`/profile`, { config })
                .then((res) => toast.success(res.data.msg))
                .catch((err) =>
                  toast.error(err.response?.data?.msg ?? translate('user.toast.networkError'))
                );
            })}
          >
            {t('common.actions.save')}
          </Button>
        </Box>
      </Stack>
    </DashboardContent>
  );
}
