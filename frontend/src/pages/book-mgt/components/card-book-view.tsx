import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import { Box, Card, Link, Stack, Avatar, CardMedia, Typography, IconButton } from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { fShortenNumber } from 'src/utils/format-number';
import { formatFilePath } from 'src/utils/format-filepath';

import { MappingType } from 'src/pages/promotions-mgt/const-type';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

export function CardBookView({ book, isEdit }: CardBookViewProps) {
  const navigate = useNavigate();
  return (
    <Card>
      <Box
        id={`img-book-${book.id}`}
        component={RouterLink}
        href={`/book-management/detail/${book.slug}`}
        position="relative"
      >
        <CardMedia
          component="img"
          loading="lazy"
          sx={{
            aspectRatio: '16 / 9',
            objectFit: 'cover',
            bgcolor: 'background.neutral',
          }}
          src={formatFilePath(book.picture[0] ?? '/$image-404.svg')}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            width: 1,
            p: 1,
            gap: 1,
            display: 'flex',
            position: 'absolute',
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          {Array.from(new Set([...book.promotions.map((x) => x.type)])).map((p) => (
            <Label
              key={p}
              variant="filled"
              color={MappingType[p as keyof typeof MappingType]?.color}
              startIcon={<Iconify icon={MappingType[p as keyof typeof MappingType]?.icon} />}
              sx={{ textTransform: 'capitalize' }}
            />
          ))}
          {book.createdAt && dayjs(book.createdAt) > dayjs().add(-7, 'day') && (
            <Label variant="filled" color="info" sx={{}}>
              New
            </Label>
          )}
        </Box>
      </Box>
      <Box
        sx={{ position: 'relative', p: 2, pt: 3, bgcolor: (t) => t.vars.palette.background.paper }}
      >
        <SvgColor
          src="/assets/icons/shape-avatar.svg"
          sx={{
            color: (t) => t.vars.palette.background.paper,
            width: 88,
            height: 36,
            position: 'absolute',
            left: 0,
            top: -21,
          }}
        />
        <Avatar
          sx={{
            position: 'absolute',
            left: 24,
            top: -14,
          }}
          src={formatFilePath(book.auth?.avatarUrl)}
        />
        {isEdit && (
          <IconButton
            onClick={() => {
              const path = '/book-management/handle';
              const query = new URLSearchParams();
              query.set('name', 'Modify-book');
              query.set('id', book.id);
              const queryCurrent = new URLSearchParams(window.location.search).toString();
              if (queryCurrent) {
                query.set('query', queryCurrent);
              }
              navigate(path + '?' + query.toString());
            }}
            sx={{
              position: 'absolute',
              right: (t) => t.spacing(1),
              top: (t) => t.spacing(1),
            }}
          >
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        )}
        <Typography color="textSecondary" variant="caption">
          {dayjs(book.createdAt).format('DD MMM YYYY')}
        </Typography>
        <Link
          color="textPrimary"
          component={RouterLink}
          id={`book-${book.id}`}
          href={`/book-management/detail/${book.slug}`}
        >
          <Typography variant="subtitle2" noWrap>
            {book.name}
          </Typography>
        </Link>
        <Stack direction="row" alignItems="center" mt={3}>
          <Box
            display="flex"
            gap={0.25}
            typography="caption"
            color="text.secondary"
            alignItems="center"
          >
            <Iconify icon="solar:eye-bold" width={16} />
            {fShortenNumber(book.viewCount)}
          </Box>
          <Typography variant="h6" color="textPrimary" position="relative" ml="auto">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'vnd' }).format(
              book.currentPrice
            )}
            {book.currentPrice !== book.price && (
              <Typography
                sx={{ textDecoration: 'line-through' }}
                position="absolute"
                bottom="100%"
                right={0}
                variant="body2"
                color="textDisabled"
                display="flex"
                alignItems="center"
              >
                <Iconify
                  sx={{ color: (t) => t.palette.success.main, mr: 0.5 }}
                  icon="eva:arrow-ios-downward-fill"
                  width={12}
                />
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'vnd' }).format(
                  book.price
                )}
              </Typography>
            )}
          </Typography>
        </Stack>
      </Box>
    </Card>
  );
}

export type CardBookViewProps = {
  book: BookView;
  isEdit?: boolean;
};
