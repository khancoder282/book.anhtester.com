import dayjs from 'dayjs';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';

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

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { LabelBorder } from 'src/components/label/label-border';
import { NoData } from 'src/components/grid-view/components/not-data';
import { CarouselThumb } from 'src/components/carousel/carousel-thumb';

import { getDetailBook } from './api/detail-book';
import { MappingType } from '../promotions-mgt/const-type';

export default function BookDetail() {
  const { slug } = useParams();
  const { data = {} as Partial<BookForm> } = useRequest(
    useCallback(() => getDetailBook(slug!), [slug])
  );
  const router = useRouter();
  console.log(data.picture);

  return (
    <DashboardContent>
      <Box mb={5}>
        <Button
          color="inherit"
          onClick={() => router.back('/book-management')}
          startIcon={<Iconify icon="eva:arrow-ios-forward-fill" sx={{ scale: -1 }} />}
        >
          Back
        </Button>
      </Box>
      <Grid container spacing={8}>
        <Grid size={{ xs: 12, md: 6, lg: 7 }}>
          {(data.picture?.length || 0) > 0 ? (
            <CarouselThumb listSrc={data.picture?.map((item) => (item as FileItem).path) ?? []} />
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
                    New
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
                >{p.name}</Label>
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

            <Typography variant="h6" color="textPrimary" position="relative" mt={5}>
              {data.currentPrice &&
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
                    sx={{ color: (t) => t.palette.success.main, mr: 0.5 }}
                    icon="eva:arrow-ios-downward-fill"
                    width={12}
                  />
                  {data.price &&
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
              <LabelBorder>Author by </LabelBorder>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
