import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { Fragment, useCallback } from 'react';

import {
  Box,
  Grid,
  Card,
  Link,
  Stack,
  Button,
  Avatar,
  Typography,
  CardHeader,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useRequest } from 'src/hooks/use-request';

import { formatFilePath } from 'src/utils/format-filepath';

import { useTranslate } from 'src/locales';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { LabelBorder } from 'src/components/label/label-border';
import { NoData } from 'src/components/grid-view/components/not-data';
import { CarouselThumb } from 'src/components/carousel/carousel-thumb';

import { getDetailBook } from './api/detail-book';
import { BookCover } from './components/book-cover';
import { MappingType } from '../promotions-mgt/const-type';

export default function BookDetail() {
  const { t } = useTranslate();
  const { slug } = useParams();
  const { data = {} as Partial<BookForm> } = useRequest(
    useCallback(() => getDetailBook(slug!), [slug])
  );
  const router = useRouter();
  // Bỏ phần tử ảnh rỗng (API chi tiết trả về 1 "ảnh" path rỗng khi sách không có ảnh)
  const pictures = (data.picture ?? []).map((item) => (item as FileItem).path).filter(Boolean);
  // Thông tin thêm (không bắt buộc): chỉ hiện dòng có giá trị
  const moreInfo = (
    [
      ['author', data.author],
      ['publisher', data.publisher],
      ['publishYear', data.publishYear],
      ['pageCount', data.pageCount],
      ['isbn', data.isbn],
      ['language', data.language],
    ] as const
  ).filter(([, value]) => value !== null && value !== undefined && value !== '');

  return (
    <DashboardContent>
      <Box mb={5}>
        <Button
          color="inherit"
          onClick={() => router.back('/book-management')}
          startIcon={<Iconify icon="eva:arrow-ios-forward-fill" sx={{ scale: -1 }} />}
        >
          {t('common.actions.back')}
        </Button>
      </Box>
      <Grid container spacing={8}>
        <Grid size={{ xs: 12, md: 6, lg: 7 }}>
          {pictures.length > 0 ? (
            <CarouselThumb listSrc={pictures} />
          ) : data.name ? (
            <BookCover name={data.name} sx={{ aspectRatio: '1 / 1', borderRadius: 2 }} />
          ) : (
            <Box p={3} width={1} sx={{ aspectRatio: '1 / 1' }}>
              <NoData />
            </Box>
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 5 }}>
          <Stack gap={2} alignItems="flex-start">
            <Box display="flex" gap={1} flexWrap="wrap">
              {data.createdAt && dayjs(data.createdAt) > dayjs().add(-7, 'day') && (
                <RouterLink href="/book-management?sort=Newest">
                  <Label
                    sx={{
                      textTransform: 'uppercase',
                      fontWeight: 900,
                      cursor: 'pointer',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                    color="info"
                  >
                    {t('book.newLabel')}
                  </Label>
                </RouterLink>
              )}

              {data.promotions?.map((p) => (
                <Label
                  key={p.id}
                  variant="filled"
                  color={MappingType[p.type].color}
                  startIcon={<Iconify icon={MappingType[p.type].icon} />}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {p.name}
                </Label>
              ))}
            </Box>
            <Box>
              {data.categories?.map((i, idx) => (
                <Link key={i} component={RouterLink} href={`/book-management?category=${i}`}>
                  {i}
                  {idx < data.categories!.length - 1 && ', '}
                </Link>
              ))}
            </Box>

            <Typography variant="h5">{data.name}</Typography>

            <Typography variant="body2" color="textSecondary" textAlign="justify">
              {data.description}
            </Typography>

            {moreInfo.length > 0 && (
              <Box
                component="dl"
                data-testid="book-more-info"
                sx={{
                  m: 0,
                  display: 'grid',
                  gridTemplateColumns: 'max-content 1fr',
                  columnGap: 2,
                  rowGap: 1,
                  typography: 'body2',
                  '& dt': { color: 'text.secondary' },
                  '& dd': { m: 0, wordBreak: 'break-word' },
                }}
              >
                {moreInfo.map(([key, value]) => (
                  <Fragment key={key}>
                    <dt>{t(`book.moreInfo.${key}`)}</dt>
                    <dd data-testid={`book-${key}`}>{value}</dd>
                  </Fragment>
                ))}
              </Box>
            )}

            <Typography variant="h6" color="textPrimary" position="relative" mt={5}>
              {typeof data.currentPrice === 'number' &&
                new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'vnd' }).format(
                  data.currentPrice
                )}
              {data.currentPrice !== data.price && (
                <Typography
                  sx={{ textDecoration: 'line-through' }}
                  bottom="100%"
                  variant="body2"
                  color="textDisabled"
                  display="flex"
                  alignItems="center"
                  position="absolute"
                  left={0}
                >
                  <Iconify
                    sx={{ color: (theme) => theme.palette.success.main, mr: 0.5 }}
                    icon="eva:arrow-ios-downward-fill"
                    width={12}
                  />
                  {typeof data.price === 'number' &&
                    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'vnd' }).format(
                      data.price
                    )}
                </Typography>
              )}
            </Typography>
            <Card sx={{ pb: 3, width: 1, overflow: 'unset', mt: 3 }}>
              <CardHeader
                title={data.auth?.name}
                subheader={data.auth?.email}
                avatar={<Avatar src={formatFilePath(data.auth?.avatarUrl)} />}
              />
              <LabelBorder>{t('book.authorBy')}</LabelBorder>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
