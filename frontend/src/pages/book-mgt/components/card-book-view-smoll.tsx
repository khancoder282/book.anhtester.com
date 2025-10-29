import dayjs from 'dayjs';
import Autoplay from 'embla-carousel-autoplay';

import { Box, Card, Link, Stack, Avatar, Typography } from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { fShortenNumber } from 'src/utils/format-number';
import { formatFilePath } from 'src/utils/format-filepath';

import { MappingType } from 'src/pages/promotions-mgt/const-type';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CarouselDefault } from 'src/components/carousel/default';

export function CardBookViewSmoll({ book, isFirst }: { book: BookView; isFirst?: boolean }) {
  return (
    <Card
      id={`book-${book.id}`}
      component={RouterLink}
      href={`/book-management/detail/${book.slug}`}
      sx={{ height: 390, position: 'relative', display: 'block' }}
    >
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
            src={formatFilePath(img)}
            alt={book.name}
          />
        ))}
      </CarouselDefault>
      <Box
        sx={{
          top: (t) => t.spacing(1),
          right: (t) => t.spacing(1),
          width: 1,
          p: 1,
          pl: 10,
          gap: 1,
          display: 'flex',
          position: 'absolute',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        {book.promotions?.map((p) => (
          <Label
            key={p.id}
            variant="filled"
            color={MappingType[p.type].color}
            startIcon={<Iconify icon={MappingType[p.type].icon} />}
            sx={{ textTransform: 'capitalize' }}
          />
        ))}
        {book.createdAt && dayjs(book.createdAt) > dayjs().add(-7, 'day') && (
          <Label variant="filled" color="info" sx={{}}>
            New
          </Label>
        )}
      </Box>
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
          src={formatFilePath(book.auth?.avatarUrl)}
        />
        <Typography variant="caption" color="white" sx={{ opacity: 0.48 }}>
          {dayjs(book.createdAt).format('DD MMM YYYY')}
        </Typography>
        <Link color="white">
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
