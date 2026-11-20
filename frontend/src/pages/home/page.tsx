import type { IconifyName } from 'src/components/iconify';

import api from 'axios';
import { varAlpha } from 'minimal-shared/utils';
import { useForm, Controller } from 'react-hook-form';

import {
  Box,
  Card,
  Link,
  Grid,
  Stack,
  Slider,
  Avatar,
  Button,
  TextField,
  Typography,
  CardHeader,
  Autocomplete,
} from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { useRequest } from 'src/hooks/use-request';

import { formatFilePath } from 'src/utils/format-filepath';

import { axios } from 'src/api/axios';
import { useAuth } from 'src/store/auth';
import { useTranslate } from 'src/locales';
import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/toast';
import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

const status = [
  { code: 200, msg: 'OK', color: '#4CAF50' }, // Xanh lá (Thành công)
  { code: 201, msg: 'Created', color: '#4CAF50' },
  { code: 202, msg: 'Accepted', color: '#4CAF50' },
  { code: 203, msg: 'Non-Authoritative Information', color: '#4CAF50' },
  { code: 204, msg: 'No Content', color: '#4CAF50' },
  { code: 205, msg: 'Reset Content', color: '#4CAF50' },
  { code: 206, msg: 'Partial Content', color: '#4CAF50' },
  { code: 207, msg: 'Multi-Status', color: '#4CAF50' },
  { code: 208, msg: 'Already Reported', color: '#4CAF50' },
  { code: 226, msg: 'IM Used', color: '#4CAF50' },

  { code: 300, msg: 'Multiple Choices', color: '#FFCA28' }, // Vàng (Chuyển hướng)
  { code: 301, msg: 'Moved Permanently', color: '#FFCA28' },
  { code: 302, msg: 'Found', color: '#FFCA28' },
  { code: 303, msg: 'See Other', color: '#FFCA28' },
  { code: 304, msg: 'Not Modified', color: '#FFCA28' },
  { code: 305, msg: 'Use Proxy', color: '#FFCA28' },
  { code: 306, msg: '(Unused)', color: '#FFCA28' },
  { code: 307, msg: 'Temporary Redirect', color: '#FFCA28' },
  { code: 308, msg: 'Permanent Redirect', color: '#FFCA28' },

  { code: 400, msg: 'Bad Request', color: '#FF9800' }, // Cam (Lỗi phía máy khách)
  { code: 401, msg: 'Unauthorized', color: '#FF9800' },
  { code: 402, msg: 'Payment Required', color: '#FF9800' },
  { code: 403, msg: 'Forbidden', color: '#FF9800' },
  { code: 404, msg: 'Not Found', color: '#FF9800' },
  { code: 405, msg: 'Method Not Allowed', color: '#FF9800' },
  { code: 406, msg: 'Not Acceptable', color: '#FF9800' },
  { code: 407, msg: 'Proxy Authentication Required', color: '#FF9800' },
  { code: 408, msg: 'Request Timeout', color: '#FF9800' },
  { code: 409, msg: 'Conflict', color: '#FF9800' },
  { code: 410, msg: 'Gone', color: '#FF9800' },
  { code: 411, msg: 'Length Required', color: '#FF9800' },
  { code: 412, msg: 'Precondition Failed', color: '#FF9800' },
  { code: 413, msg: 'Payload Too Large', color: '#FF9800' },
  { code: 414, msg: 'URI Too Long', color: '#FF9800' },
  { code: 415, msg: 'Unsupported Media Type', color: '#FF9800' },
  { code: 416, msg: 'Range Not Satisfiable', color: '#FF9800' },
  { code: 417, msg: 'Expectation Failed', color: '#FF9800' },
  { code: 418, msg: "I'm a Teapot", color: '#FF9800' },
  { code: 421, msg: 'Misdirected Request', color: '#FF9800' },
  { code: 422, msg: 'Unprocessable Entity', color: '#FF9800' },
  { code: 423, msg: 'Locked', color: '#FF9800' },
  { code: 424, msg: 'Failed Dependency', color: '#FF9800' },
  { code: 425, msg: 'Too Early', color: '#FF9800' },
  { code: 426, msg: 'Upgrade Required', color: '#FF9800' },
  { code: 428, msg: 'Precondition Required', color: '#FF9800' },
  { code: 429, msg: 'Too Many Requests', color: '#FF9800' },
  { code: 431, msg: 'Request Header Fields Too Large', color: '#FF9800' },
  { code: 451, msg: 'Unavailable For Legal Reasons', color: '#FF9800' },

  { code: 500, msg: 'Internal Server Error', color: '#F44336' }, // Đỏ đậm (Lỗi phía máy chủ)
  { code: 501, msg: 'Not Implemented', color: '#F44336' },
  { code: 502, msg: 'Bad Gateway', color: '#F44336' },
  { code: 503, msg: 'Service Unavailable', color: '#F44336' },
  { code: 504, msg: 'Gateway Timeout', color: '#F44336' },
  { code: 505, msg: 'HTTP Version Not Supported', color: '#F44336' },
  { code: 506, msg: 'Variant Also Negotiates', color: '#F44336' },
  { code: 507, msg: 'Insufficient Storage', color: '#F44336' },
  { code: 508, msg: 'Loop Detected', color: '#F44336' },
  { code: 510, msg: 'Not Extended', color: '#F44336' },
  { code: 511, msg: 'Network Authentication Required', color: '#F44336' },
];

const Icon: Record<number, IconifyName> = {
  2: 'eva:checkmark-fill',
  3: 'eva:checkmark-fill',
  4: 'mingcute:close-line',
  5: 'mingcute:close-line',
  6: 'solar:clock-circle-outline',
};

const ViewCard = ({
  title,
  total: totalBook,
  unit,
  icon,
  color,
  href,
}: {
  title: string;
  total: number;
  unit: string;
  icon: string;
  color: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';
  href: string;
}) => {
  const { t } = useTranslate();
  // Icon nằm trên tiêu đề (cùng kiểu hai thẻ phía trên), không dùng position absolute,
  // để tiêu đề tiếng Việt dài không bị icon đè lên.
  return (
    <Card
      component={Stack}
      gap={2}
      sx={{
        p: 3,
        height: 1,
        background: (theme) =>
          `linear-gradient(30deg, ${varAlpha(theme.vars.palette[color].mainChannel, 0.2)} 0%, rgba(0, 0, 0, 0) 60%)`,
      }}
    >
      <Link
        component={RouterLink}
        href={href}
        aria-label={title}
        data-action="open-page"
        sx={{
          width: 52,
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'flex-start',
          borderRadius: 1.75,
          bgcolor: (theme) => varAlpha(theme.vars.palette[color].mainChannel, 0.16),
          transition: (theme) => theme.transitions.create(['background-color', 'transform']),
          '&:hover': {
            transform: 'scale(1.06)',
            bgcolor: (theme) => varAlpha(theme.vars.palette[color].mainChannel, 0.28),
          },
        }}
      >
        <SvgColor
          src={`/assets/icons/navbar/${icon}.svg`}
          sx={{ width: 28, height: 28, color: `${color}.main` }}
        />
      </Link>
      <Box>
        <Link
          component={RouterLink}
          href={href}
          color={color}
          underline="hover"
          data-action="open-page"
          sx={{ display: 'inline-block' }}
        >
          <Typography variant="h6">{title}</Typography>
        </Link>
        <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
          {t('home.stats.total', { count: totalBook, unit })}
        </Typography>
      </Box>
    </Card>
  );
};

export default function Page() {
  const { t } = useTranslate();
  const { auth } = useAuth();
  const form = useForm<{ time: number; code: number | '' }>();

  const { data: totalUser = 0 } = useRequest(
    async () =>
      await axios.get('/user', { params: { limit: 1 } }).then((e) => e.data.pagination.total)
  );

  const { data: totalBook = 0 } = useRequest(
    async () =>
      await axios.get('/book', { params: { limit: 1 } }).then((e) => e.data.pagination.total)
  );

  const { data: totalPromotion = 0 } = useRequest(
    async () =>
      await axios
        .get('/promotion-book', { params: { limit: 1 } })
        .then((e) => e.data.pagination.total)
  );

  const { data: totalCategory = 0 } = useRequest(
    async () => await axios.get('/category-book').then((e) => e.data.pagination.total)
  );

  const handleAction = (item: { code: number; msg: string; time?: number }) => () => {
    toast.loading(
      () =>
        api.post('/api/status', {
          code: item.code,
          msg: item.msg,
          time: item.time,
        }),
      {
        loading: t('home.testMessage.loading'),
        // 204/205/304 không có body → dùng câu chuẩn của mã đó; lỗi mạng không có err.response
        success: (res) => res.data?.msg || item.msg,
        error: (err) => err?.response?.data?.msg || t('common.somethingWrong'),
      }
    );
  };

  return (
    <DashboardContent>
      <Stack spacing={3}>
        <Card>
          <Box
            component="img"
            alt={t('home.bannerAlt')}
            src="/assets/Free-API-for-Testing.png"
            srcSet="/assets/thumb.webp 1x, /assets/Free-API-for-Testing.png 2x"
            sx={{
              width: 1,
              border: 'none',
              aspectRatio: '1200/628',
              objectFit: 'cover',
              borderRadius: 2,
            }}
          />
        </Card>
        <Box
          display="flex"
          sx={{
            gap: 3,
            flexDirection: { xs: 'column', md: 'row' },
            '&>*': {
              flex: 1,
            },
          }}
        >
          <Card
            component={Stack}
            p={3}
            gap={2}
            sx={{
              background: (theme) =>
                `linear-gradient(30deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.1)} 0%, rgba(0, 0, 0, 0) 60%, ${varAlpha(theme.vars.palette.secondary.mainChannel, 0.1)} 100%)`,
            }}
          >
            <Box
              sx={{
                bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.2),
                alignSelf: 'start',
                p: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 2,
                color: 'primary.main',
              }}
            >
              <Iconify icon="solar:document-add-bold" />
            </Box>
            <Link component="a" href="/swagger" target="_blank">
              <Typography variant="h6">{t('home.swagger.title')}</Typography>
            </Link>
            <Typography variant="body2" color="textSecondary">
              {t('home.swagger.description')}
            </Typography>
          </Card>

          <Card
            component={Stack}
            p={3}
            gap={2}
            sx={{
              background: (theme) =>
                `linear-gradient(30deg, ${varAlpha(theme.vars.palette.info.mainChannel, 0.1)} 0%, rgba(0, 0, 0, 0) 60%, ${varAlpha(theme.vars.palette.secondary.mainChannel, 0.1)} 100%)`,
            }}
          >
            {auth ? (
              <Avatar
                sx={{ width: 52, height: 52, borderRadius: 1.75 }}
                src={formatFilePath(auth?.avatarUrl)}
              />
            ) : (
              <Box
                sx={{
                  bgcolor: (theme) => varAlpha(theme.vars.palette.info.mainChannel, 0.2),
                  alignSelf: 'start',
                  p: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 1.75,
                  color: 'info.main',
                }}
              >
                <Iconify icon="solar:user-plus-bold" />
              </Box>
            )}
            <Link
              color="info"
              underline={!auth ? 'hover' : 'none'}
              {...(!auth && {
                component: RouterLink,
                href: '/sign-in',
              })}
            >
              <Typography variant="h6">
                {auth ? t('home.welcome.title', { name: auth.name }) : t('home.welcome.signIn')}
              </Typography>
            </Link>
            <Typography variant="body2" color="textSecondary">
              {auth ? t('home.welcome.descriptionAuth') : t('home.welcome.descriptionGuest')}
            </Typography>
          </Card>
        </Box>

        <Grid container spacing={3} columns={{ xs: 1, sm: 2, lg: 4 }}>
          <Grid size={1}>
            <ViewCard
              total={totalUser}
              title={t('home.stats.user')}
              unit={t('home.stats.users')}
              icon="ic-user"
              href="/user-management"
              color="info"
            />
          </Grid>

          <Grid size={1}>
            <ViewCard
              total={totalBook}
              title={t('home.stats.book')}
              unit={t('home.stats.books')}
              icon="ic-book"
              href="/book-management"
              color="success"
            />
          </Grid>

          <Grid size={1}>
            <ViewCard
              total={totalCategory}
              title={t('home.stats.category')}
              unit={t('home.stats.categories')}
              icon="ic-category"
              href="/category-management"
              color="error"
            />
          </Grid>
          <Grid size={1}>
            <ViewCard
              total={totalPromotion}
              title={t('home.stats.promotion')}
              unit={t('home.stats.promotions')}
              icon="ic-sale"
              href="/promotion-book-management"
              color="warning"
            />
          </Grid>
        </Grid>

        <Card
          component="form"
          noValidate
          sx={{ overflow: 'visible' }}
          onSubmit={form.handleSubmit((data) =>
            handleAction({
              time: data.time,
              code: Number(data.code),
              msg: status.find((item) => item.code === Number(data.code))?.msg ?? '',
            })()
          )}
        >
          <CardHeader title={t('home.testMessage.title')} />
          <Stack p={3} spacing={3}>
            <Stack direction="row" alignItems="center" gap={3}>
              <Typography sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                {t('home.testMessage.timeout')}
              </Typography>
              <Controller
                control={form.control}
                name="time"
                defaultValue={1}
                render={({ field }) => (
                  <Slider
                    valueLabelDisplay="auto"
                    sx={{ height: 12 }}
                    min={0}
                    max={10}
                    step={1}
                    {...field}
                  />
                )}
              />
            </Stack>
            <Controller
              control={form.control}
              name="code"
              defaultValue={200}
              rules={{
                // Để trống thì không gửi (trước đây gửi code: 0 và msg rỗng)
                validate: (v) =>
                  status.some((s) => s.code === Number(v)) ||
                  t('home.testMessage.statusCodeRequired'),
              }}
              render={({ field, fieldState: { error } }) => (
                <Autocomplete
                  options={status}
                  getOptionLabel={(option) => `${option.code} - ${option.msg}`}
                  value={status.find((s) => s.code === field.value) || null}
                  onChange={(_, newValue) => field.onChange(newValue?.code ?? '')}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Avatar
                        sx={{ bgcolor: option.color, color: 'white', mr: 1, width: 24, height: 24 }}
                      >
                        <Iconify width={16} icon={Icon[Math.floor(option.code / 100)]} />
                      </Avatar>
                      <strong style={{ marginRight: '0.5rem' }}>{option.code}</strong> {option.msg}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('home.testMessage.statusCode')}
                      variant="outlined"
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              )}
            />
            <Button type="submit" size="large" variant="contained" sx={{ alignSelf: 'flex-end' }}>
              {t('common.actions.submit')}
            </Button>
          </Stack>
        </Card>
      </Stack>
    </DashboardContent>
  );
}
