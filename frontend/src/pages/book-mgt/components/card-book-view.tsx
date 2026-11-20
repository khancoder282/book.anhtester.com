import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import { Box, Card, Link, Stack, Tooltip, IconButton, Typography } from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { fShortenNumber } from 'src/utils/format-number';

import { useTranslate } from 'src/locales';
import { atBg, atInk, atGrad, atGlow, toneOf } from 'src/theme/at-tones';

import { Iconify } from 'src/components/iconify';

import { Book3D } from './book-3d';
import { formatVnd } from '../utils/pricing';
import { useAddToCart } from '../hooks/use-add-to-cart';

// ----------------------------------------------------------------------

export type CardBookViewProps = {
  book: BookView;
  isEdit?: boolean;
};

/** Nhãn nhỏ trên bìa: nền gradient theo tone */
function CoverBadge({
  tone,
  children,
  testId,
}: {
  tone: Parameters<typeof atGrad>[0];
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <Box
      component="span"
      data-testid={testId}
      sx={{
        px: 1,
        py: 0.25,
        color: '#fff',
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1.6,
        borderRadius: 999,
        whiteSpace: 'nowrap',
        backgroundImage: atGrad(tone),
        boxShadow: atGlow(tone),
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Thẻ sách kiểu nhà sách: bìa dọc trên "kệ", nhãn giảm giá / mới / đọc thử, thể loại, tên sách
 * (chữ có chân), tác giả, lượt xem, giá và nút thêm vào giỏ.
 */
export function CardBookView({ book, isEdit }: CardBookViewProps) {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const addToCart = useAddToCart();
  const href = `/book-management/detail/${book.slug}`;
  const discount =
    book.price > 0 && book.currentPrice < book.price
      ? Math.round(((book.price - book.currentPrice) / book.price) * 100)
      : 0;
  const isNew = book.createdAt && dayjs(book.createdAt) > dayjs().add(-7, 'day');
  const unavailable = book.status === 'UNAVAILABLE';
  const category = book.categories[0];

  return (
    <Card
      className="book-hover"
      data-testid={`book-card-${book.slug}`}
      sx={{
        height: 1,
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow .25s, transform .25s, border-color .25s',
        '&:hover': {
          borderColor: 'primary.lighter',
          boxShadow: '0 1px 2px rgba(15,23,42,.06), 0 14px 30px -10px rgba(15,23,42,.18)',
        },
      }}
    >
      {/* Kệ sách */}
      <Box
        id={`img-book-${book.id}`}
        component={RouterLink}
        href={href}
        aria-label={book.name}
        sx={{
          position: 'relative',
          display: 'block',
          px: { xs: 3, sm: 4 },
          pt: 4,
          pb: 3,
          textDecoration: 'none',
          background: (theme) =>
            `radial-gradient(120% 90% at 50% 0%, ${theme.vars.palette.background.paper} 0%, var(--at-sunken) 70%)`,
          // Mặt kệ dưới chân sách
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 14,
            height: 8,
            borderRadius: 999,
            background: 'linear-gradient(180deg, rgba(15,23,42,.10), rgba(15,23,42,0))',
            filter: 'blur(2px)',
          },
        }}
      >
        <Book3D
          src={book.picture[0]}
          name={book.name}
          sx={{
            mx: 'auto',
            width: { xs: '82%', sm: '74%' },
            opacity: unavailable ? 0.6 : 1,
            filter: unavailable ? 'grayscale(.6)' : 'none',
          }}
        />

        <Stack
          spacing={0.5}
          alignItems="flex-start"
          sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1 }}
        >
          {discount > 0 && (
            <CoverBadge tone="orange" testId="book-card-discount">
              {t('bookstore.card.discount', { percent: discount })}
            </CoverBadge>
          )}
          {isNew && (
            <CoverBadge tone="sky" testId="book-card-new">
              {t('book.newLabel')}
            </CoverBadge>
          )}
          {book.hasPreview && (
            <CoverBadge tone="purple" testId="book-card-preview">
              {t('bookstore.card.preview')}
            </CoverBadge>
          )}
          {unavailable && (
            <CoverBadge tone="slate" testId="book-card-unavailable">
              {t('bookstore.card.unavailable')}
            </CoverBadge>
          )}
        </Stack>
      </Box>

      {isEdit && (
        <Tooltip title={t('bookstore.card.edit')}>
          <IconButton
            aria-label={t('bookstore.card.edit')}
            data-testid="book-card-edit"
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
              top: 8,
              right: 8,
              zIndex: 2,
              bgcolor: 'background.paper',
              boxShadow: 'var(--at-shadow-sm)',
              '&:hover': { bgcolor: 'background.paper', color: 'primary.main' },
            }}
          >
            <Iconify icon="solar:pen-bold" width={18} />
          </IconButton>
        </Tooltip>
      )}

      <Stack spacing={0.75} sx={{ p: 2, pt: 1.5, flex: 1 }}>
        {category && (
          <Box
            component={RouterLink}
            href={`/book-management?category=${encodeURIComponent(category)}`}
            data-testid="book-card-category"
            sx={{
              alignSelf: 'flex-start',
              px: 1,
              py: 0.25,
              fontSize: 12.5,
              fontWeight: 600,
              borderRadius: 999,
              textDecoration: 'none',
              bgcolor: atBg(toneOf(category)),
              color: atInk(toneOf(category)),
            }}
          >
            {category}
          </Box>
        )}

        <Link
          color="textPrimary"
          component={RouterLink}
          id={`book-${book.id}`}
          href={href}
          underline="none"
          sx={{ '&:hover': { color: 'primary.main' } }}
        >
          <Typography
            title={book.name}
            sx={{
              fontFamily: (theme) => theme.typography.fontSecondaryFamily,
              fontWeight: 700,
              fontSize: 16.5,
              lineHeight: 1.4,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: '2.8em',
            }}
          >
            {book.name}
          </Typography>
        </Link>

        <Typography variant="body2" color="text.secondary" noWrap data-testid="book-card-author">
          {book.author || t('bookstore.card.unknownAuthor')}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'text.disabled',
            typography: 'caption',
          }}
        >
          <Iconify icon="solar:eye-bold" width={16} />
          {fShortenNumber(book.viewCount)}
        </Box>

        <Stack direction="row" alignItems="flex-end" sx={{ mt: 'auto !important', pt: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {book.currentPrice !== book.price && (
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ textDecoration: 'line-through', display: 'block' }}
                data-testid="book-card-price"
              >
                {formatVnd(book.price)}
              </Typography>
            )}
            <Typography
              data-testid="book-card-current-price"
              sx={{ fontWeight: 800, fontSize: 18, color: atInk('orange') }}
            >
              {formatVnd(book.currentPrice)}
            </Typography>
          </Box>
          <Tooltip
            title={unavailable ? t('bookstore.card.unavailable') : t('bookstore.card.addToCart')}
          >
            <span>
              <IconButton
                disabled={unavailable}
                aria-label={t('bookstore.card.addToCart')}
                data-testid="book-card-add-to-cart"
                onClick={() =>
                  addToCart({
                    id: book.id,
                    slug: book.slug,
                    name: book.name,
                    picture: book.picture[0],
                  })
                }
                sx={{
                  borderRadius: 1.5,
                  color: 'primary.main',
                  bgcolor: atBg('green'),
                  boxShadow: 'inset 0 0 0 1px var(--at-line)',
                  transition: 'all .15s',
                  '&:hover': {
                    color: '#fff',
                    backgroundImage: atGrad('green'),
                    boxShadow: atGlow('green'),
                  },
                }}
              >
                <Iconify icon="solar:cart-plus-bold" width={22} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Card>
  );
}
