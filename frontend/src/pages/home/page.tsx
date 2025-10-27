import type { IconifyName } from 'src/components/iconify';

import api from 'axios';
import dayjs from 'dayjs';
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
  Divider,
  MenuItem,
  CardMedia,
  TextField,
  Typography,
  ButtonBase,
} from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { useRequest } from 'src/hooks/use-request';

import { formatFilePath } from 'src/utils/format-filepath';

import { axios } from 'src/api/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/toast';
import { Iconify } from 'src/components/iconify';
import { CarouselDefault } from 'src/components/carousel/default';

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

export default function Page() {
  const { data: books } = useRequest(() =>
    axios.get('/book').then((res) => res.data.list as BookView[])
  );
  const form = useForm<{ time: number; code: number }>();

  const handleAction = (item: { code: number; msg: string; time?: number }) => () => {
    toast.loading(
      () => api.post('/api/status', { code: item.code, msg: item.msg, time: item.time }),
      {
        loading: 'Loading ...',
        success: (t) => t.data.msg,
        error: (t) => t.response.data.msg,
      }
    );
  };

  return (
    <DashboardContent>
      <Stack spacing={2}>
        <CarouselDefault options={{ size: 1 }}>
          {books?.map((book) => (
            <Box key={book.id} sx={{ flex: '0 0 100%' }}>
              <Card>
                <CardMedia
                  component="img"
                  sx={{ aspectRatio: '21 / 9', minHeight: 300 }}
                  src={formatFilePath(book.picture[0] ?? '/$image-404.svg')}
                />
                <Stack
                  sx={{
                    justifyContent: 'end',
                    p: 3,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 1,
                    height: 1,
                    background:
                      'linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0.15) 100%)',
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.48 }}>
                    {dayjs(book.createdAt).format('DD MMM YYYY')}
                  </Typography>
                  <Typography variant="h5" sx={{ color: 'white', mb: 3 }}>
                    {book.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.48 }}>
                    {book.description}
                  </Typography>
                </Stack>
              </Card>
            </Box>
          ))}
        </CarouselDefault>
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
              background: (t) =>
                `linear-gradient(30deg, ${varAlpha(t.vars.palette.primary.mainChannel, 0.1)} 0%, rgba(0, 0, 0, 0) 60%, ${varAlpha(t.vars.palette.secondary.mainChannel, 0.1)} 100%)`,
            }}
          >
            <Box
              sx={{
                bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.2),
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
            <Link component="a" href="/swagger">
              <Typography variant="h6">Swagger API Documentation</Typography>
            </Link>
            <Typography variant="body2">
              Đây là tài liệu hướng dẫn chi tiết sử dụng các API đang có trong hệ thống của chúng
              tôi. Bạn có thể tìm hiểu về cách gọi, tham số, định dạng trả về và ví dụ minh họa cho
              mỗi API. Tài liệu này được cập nhật thường xuyên để phản ánh những thay đổi và cải
              tiến của hệ thống.
            </Typography>
          </Card>

          <Card
            component={Stack}
            p={3}
            gap={2}
            sx={{
              background: (t) =>
                `linear-gradient(30deg, ${varAlpha(t.vars.palette.info.mainChannel, 0.1)} 0%, rgba(0, 0, 0, 0) 60%, ${varAlpha(t.vars.palette.secondary.mainChannel, 0.1)} 100%)`,
            }}
          >
            <Box
              sx={{
                bgcolor: (t) => varAlpha(t.vars.palette.info.mainChannel, 0.2),
                alignSelf: 'start',
                p: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 2,
                color: 'info.main',
              }}
            >
              <Iconify icon="solar:user-plus-bold" />
            </Box>
            <Link color="info" component={RouterLink} href="/sign-in">
              <Typography variant="h6">Book management sign in</Typography>
            </Link>
            <Typography variant="body2">
              Đăng nhập vào trang quản lý sách, bao gồm tạo, cập nhật và xóa sách, tài liệu, người
              dùng, tệp, danh
            </Typography>
          </Card>
        </Box>
        <Divider textAlign="left" sx={{ color: 'text.secondary' }}>
          List status text
        </Divider>
        <Grid
          container
          spacing={2}
          columns={{
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 5,
          }}
        >
          {status.map((item, index) => (
            <Grid size={1} key={index}>
              <Card id={`status-${item.code}`}>
                <ButtonBase sx={{ py: 4, width: 1 }} onClick={handleAction(item)}>
                  <Stack alignItems="center">
                    <Box
                      sx={{
                        height: 36,
                        width: 36,
                        bgcolor: item.color,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 4,
                        color: 'white',
                        boxShadow: 8,
                        mb: 2,
                      }}
                    >
                      <Iconify
                        width={0.6}
                        icon={Icon[parseInt((item.code / 100).toFixed(0), 10)]}
                      />
                    </Box>
                    <Typography variant="h4" sx={{ color: item.color }}>
                      {item.code}
                    </Typography>
                    <Typography variant="body2">{item.msg}</Typography>
                  </Stack>
                </ButtonBase>
              </Card>
            </Grid>
          ))}
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
          <Stack p={3} px={5} spacing={3}>
            <Stack direction="row" alignItems="center" gap={2}>
              <Typography>Timeout</Typography>
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
            <TextField
              select
              sx={{
                '& .MuiSelect-select': {
                  display: 'flex',
                },
              }}
              defaultValue={200}
              {...form.register('code')}
            >
              {status.map((option) => (
                <MenuItem key={option.code} value={option.code}>
                  <Avatar
                    sx={{ bgcolor: option.color, color: 'white', mr: 1, width: 24, height: 24 }}
                  >
                    <Iconify width={16} icon={Icon[parseInt((option.code / 100).toFixed(0), 10)]} />
                  </Avatar>
                  {option.msg}
                </MenuItem>
              ))}
            </TextField>
            <Button
              type="submit"
              size="large"
              color="inherit"
              variant="contained"
              sx={{ alignSelf: 'flex-end' }}
            >
              Submit
            </Button>
          </Stack>
        </Card>
      </Stack>
    </DashboardContent>
  );
}
