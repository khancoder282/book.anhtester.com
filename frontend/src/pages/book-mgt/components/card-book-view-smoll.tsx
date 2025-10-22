import dayjs from 'dayjs';
import Autoplay from 'embla-carousel-autoplay';

import { Box, Card, Link, Stack, Avatar, Typography } from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { fShortenNumber } from 'src/utils/format-number';
import { formatfilePath } from 'src/utils/format-filepath';

import { Iconify } from 'src/components/iconify';
import { CarouselDefault } from 'src/components/carousel/default';

export function CardBookViewSmoll({ book, isFirst }: { book: BookView; isFirst?: boolean }) {
  return (
    <Card sx={{ height: 1, position: 'relative' }}>
      <CarouselDefault
        plugin={[Autoplay({ delay: 5000, playOnInit: true })]}
        sx={{ height: 1, minHeight: 320 }}
        options={{ loop: true }}
      >
        {book.picture.map((img) => (
          <Box
            sx={{
              flex: '0 0 100%',
              height: 1,
              objectFit: 'cover',
            }}
            component="img"
            key={img}
            src={formatfilePath(img)}
            alt={book.name}
          />
        ))}
      </CarouselDefault>
      <Stack
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1,
          height: 1,
          p: 3,
          zIndex: 1,
          justifyContent: 'flex-end',
          background: 'linear-gradient(180deg, transparent 20%, #000a 90%)',
        }}
      >
        <Avatar
          sx={{
            position: 'absolute',
            top: (t) => t.spacing(3),
            boxShadow: (t) => t.customShadows.z12,
          }}
        />
        <Typography variant="caption" color="white" sx={{ opacity: 0.48 }}>
          {dayjs(book.createdAt).format('DD MMM YYYY')}
        </Typography>
        <Link
          id={`book-${book.id}`}
          component={RouterLink}
          href={`/book-management/detail/${book.slug}/${book.id}`}
          color="white"
        >
          <Typography
            variant={isFirst ? 'h6' : 'subtitle2'}
            sx={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              WebkitLineClamp: 2,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              height: '3em',
            }}
          >
            {book.name}
          </Typography>
        </Link>
        <Typography
          variant="body2"
          color="white"
          sx={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            WebkitLineClamp: 2,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            height: '3em',
            opacity: 0.72,
          }}
        >
          {book.description}
        </Typography>
        <Stack direction="row" alignItems="center" mt={3} color="white">
          <Box
            display="flex"
            gap={0.25}
            typography="caption"
            alignItems="center"
            sx={{ opacity: 0.6 }}
          >
            <Iconify icon="solar:eye-bold" width={16} />
            {fShortenNumber(book.viewCount)}
          </Box>
          <Typography variant="h6" position="relative" ml="auto">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'vnd' }).format(
              book.currentPrice
            )}
            {book.currentPrice !== book.price && (
              <Typography
                sx={{ textDecoration: 'line-through', opacity: 0.48 }}
                position="absolute"
                bottom="100%"
                right={0}
                variant="body2"
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
      </Stack>
    </Card>
  );
}
