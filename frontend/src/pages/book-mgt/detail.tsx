import type { IconifyName } from 'src/components/iconify';

import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { Fragment, useState, useCallback } from 'react';

import {
  Box,
  Grid,
  Link,
  Stack,
  Button,
  Avatar,
  Tooltip,
  Divider,
  Skeleton,
  Typography,
  IconButton,
  Breadcrumbs,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useRequest } from 'src/hooks/use-request';

import { fNumber } from 'src/utils/format-number';
import { formatFilePath } from 'src/utils/format-filepath';

import { useAuth } from 'src/store/auth';
import { useTranslate } from 'src/locales';
import { DashboardContent } from 'src/layouts/dashboard';
import { atBg, atInk, toneOf } from 'src/theme/at-tones';

import { Label } from 'src/components/label';
import { toast } from 'src/components/toast';
import { Iconify } from 'src/components/iconify';
import { QuantityInput } from 'src/components/quantity-input/quantity-input';

import { getDetailBook } from './api/detail-book';
import { useAddToCart } from './hooks/use-add-to-cart';
import { BookGallery } from './components/book-gallery';
import { RelatedBooks } from './components/related-books';
import { MappingType } from '../promotions-mgt/const-type';
import { formatVnd, promotionStatus } from './utils/pricing';
import { BookReader, parsePreview } from './components/book-reader';

// Cùng ngưỡng với backend (order-controller FREE_SHIP_THRESHOLD)
const FREE_SHIP_THRESHOLD = 500_000;

function Pill({
  icon,
  children,
  tone,
  testId,
}: {
  icon: IconifyName;
  children: React.ReactNode;
  tone: Parameters<typeof atBg>[0];
  testId?: string;
}) {
  return (
    <Box
      component="span"
      data-testid={testId}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.25,
        py: 0.5,
        borderRadius: 999,
        fontSize: 13.5,
        fontWeight: 600,
        bgcolor: atBg(tone),
        color: atInk(tone),
      }}
    >
      <Iconify icon={icon} width={16} />
      {children}
    </Box>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="h5"
      component="h2"
      sx={{
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        fontFamily: (theme) => theme.typography.fontSecondaryFamily,
        '&::before': {
          content: '""',
          width: 5,
          height: 22,
          borderRadius: 2,
          backgroundImage: 'var(--at-grad-green)',
        },
      }}
    >
      {children}
    </Typography>
  );
}

export default function BookDetail() {
  const { t } = useTranslate();
  const { slug } = useParams();
  const { auth } = useAuth();
  const router = useRouter();
  const addToCart = useAddToCart();
  const [qty, setQty] = useState(1);
  const [readerOpen, setReaderOpen] = useState(false);
  const { data = {} as Partial<BookForm>, loading } = useRequest(
    useCallback(() => getDetailBook(slug!), [slug])
  );

  // Bỏ phần tử ảnh rỗng (API chi tiết trả về 1 "ảnh" path rỗng khi sách không có ảnh)
  const pictures = (data.picture ?? []).map((item) => (item as FileItem).path).filter(Boolean);
  const price = typeof data.price === 'number' ? data.price : 0;
  const currentPrice = typeof data.currentPrice === 'number' ? data.currentPrice : price;
  const saving = price - currentPrice;
  const savingPercent = price > 0 ? Math.round((saving / price) * 100) : 0;
  const unavailable = data.status === 'UNAVAILABLE';
  const freeShipPromo = (data.promotions ?? []).some(
    (p) => p.type === 'FREE_SHIPPING' && promotionStatus(p) === 'running'
  );
  const previewBlocks = data.previewContent ? parsePreview(data.previewContent) : [];
  const firstCategory = data.categories?.[0];

  // Thông tin thêm (không bắt buộc): chỉ hiện dòng có giá trị
  const moreInfo = (
    [
      ['author', data.author, 'solar:user-rounded-bold'],
      ['publisher', data.publisher, 'solar:buildings-2-bold'],
      ['publishYear', data.publishYear, 'solar:calendar-minimalistic-bold'],
      ['pageCount', data.pageCount, 'solar:document-text-bold'],
      ['isbn', data.isbn, 'solar:barcode-bold'],
      ['language', data.language, 'solar:global-bold'],
    ] as const
  ).filter(([, value]) => value !== null && value !== undefined && value !== '');

  const cartBook = data.id
    ? { id: data.id, slug: data.slug!, name: data.name!, picture: pictures[0] ?? null }
    : null;

  const copy = (text: string) =>
    navigator.clipboard
      ?.writeText(text)
      .then(() => toast.success(t('bookstore.detail.copied')))
      .catch(() => undefined);

  if (loading && !data.id) {
    return (
      <DashboardContent maxWidth="xl">
        <Grid container spacing={6} sx={{ mt: 4 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Skeleton variant="rounded" sx={{ aspectRatio: '4 / 5', height: 'auto' }} />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Skeleton width="40%" height={32} />
            <Skeleton width="80%" height={56} />
            <Skeleton width="30%" />
            <Skeleton variant="rounded" height={160} sx={{ mt: 3 }} />
          </Grid>
        </Grid>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Button
          color="inherit"
          onClick={() => router.back('/book-management')}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
        >
          {t('common.actions.back')}
        </Button>
        <Breadcrumbs sx={{ display: { xs: 'none', sm: 'flex' } }} data-testid="book-breadcrumbs">
          <Link component={RouterLink} href="/book-management" color="text.secondary">
            {t('bookstore.detail.books')}
          </Link>
          {firstCategory && (
            <Link
              component={RouterLink}
              href={`/book-management?category=${encodeURIComponent(firstCategory)}`}
              color="text.secondary"
            >
              {firstCategory}
            </Link>
          )}
          <Typography color="text.primary" noWrap sx={{ maxWidth: 360 }}>
            {data.name}
          </Typography>
        </Breadcrumbs>
      </Stack>

      <Grid container spacing={{ xs: 4, md: 6 }}>
        {/* Ảnh */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>
            {data.name && <BookGallery name={data.name} pictures={pictures} />}
          </Box>
        </Grid>

        {/* Thông tin chính + mua */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2.5} alignItems="flex-start">
            <Box display="flex" gap={1} flexWrap="wrap">
              {data.categories?.map((c) => (
                <Box
                  key={c}
                  component={RouterLink}
                  href={`/book-management?category=${encodeURIComponent(c)}`}
                  data-testid="book-detail-category"
                  sx={{
                    px: 1.25,
                    py: 0.4,
                    fontSize: 13.5,
                    fontWeight: 600,
                    borderRadius: 999,
                    textDecoration: 'none',
                    bgcolor: atBg(toneOf(c)),
                    color: atInk(toneOf(c)),
                    '&:hover': { filter: 'brightness(.97)' },
                  }}
                >
                  {c}
                </Box>
              ))}
              {data.createdAt && dayjs(data.createdAt) > dayjs().add(-7, 'day') && (
                <RouterLink href="/book-management?sort=Newest">
                  <Label
                    sx={{ textTransform: 'uppercase', fontWeight: 900, cursor: 'pointer' }}
                    color="info"
                  >
                    {t('book.newLabel')}
                  </Label>
                </RouterLink>
              )}
            </Box>

            <Typography
              component="h1"
              data-testid="book-detail-name"
              sx={{
                fontFamily: (theme) => theme.typography.fontSecondaryFamily,
                fontWeight: 700,
                fontSize: { xs: 22, md: 26 },
                lineHeight: 1.4,
                wordBreak: 'break-word',
              }}
            >
              {data.name}
            </Typography>

            {data.author && (
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                {t('bookstore.detail.author')}:{' '}
                <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  {data.author}
                </Box>
              </Typography>
            )}

            <Stack direction="row" gap={1} flexWrap="wrap">
              {unavailable ? (
                <Pill icon="solar:close-circle-bold" tone="red" testId="book-detail-status">
                  {t('bookstore.detail.outOfStock')}
                </Pill>
              ) : (
                <Pill icon="solar:check-circle-bold" tone="green" testId="book-detail-status">
                  {t('bookstore.detail.inStock')}
                </Pill>
              )}
              <Pill icon="solar:eye-bold" tone="sky">
                {t('bookstore.detail.views', { count: fNumber(data.viewCount ?? 0) })}
              </Pill>
              {data.pageCount && (
                <Pill icon="solar:document-text-bold" tone="purple">
                  {t('bookstore.detail.pages', { count: data.pageCount })}
                </Pill>
              )}
              {data.language && (
                <Pill icon="solar:global-bold" tone="teal">
                  {data.language}
                </Pill>
              )}
            </Stack>

            {/* Khung giá */}
            <Box
              data-testid="book-price-panel"
              sx={{
                width: 1,
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                border: '1px solid var(--at-line)',
                background: 'linear-gradient(135deg, var(--at-orange-bg) 0%, var(--at-sunken) 60%)',
              }}
            >
              <Stack direction="row" alignItems="baseline" gap={1.5} flexWrap="wrap">
                <Typography
                  data-testid="book-current-price"
                  sx={{
                    fontSize: { xs: 30, md: 36 },
                    fontWeight: 800,
                    color: atInk('orange'),
                    lineHeight: 1.2,
                  }}
                >
                  {formatVnd(currentPrice)}
                </Typography>
                {saving > 0 && (
                  <>
                    <Typography
                      variant="h6"
                      color="text.disabled"
                      data-testid="book-price"
                      sx={{ textDecoration: 'line-through', fontWeight: 500 }}
                    >
                      {formatVnd(price)}
                    </Typography>
                    <Box
                      component="span"
                      sx={{
                        px: 1,
                        py: 0.25,
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 13,
                        borderRadius: 999,
                        backgroundImage: 'var(--at-grad-orange)',
                      }}
                    >
                      -{savingPercent}%
                    </Box>
                  </>
                )}
              </Stack>
              {saving > 0 && (
                <Typography
                  variant="body2"
                  sx={{ mt: 0.5, color: atInk('green'), fontWeight: 600 }}
                >
                  {t('bookstore.detail.save', {
                    amount: formatVnd(saving),
                    percent: savingPercent,
                  })}
                </Typography>
              )}

              {!!data.promotions?.length && (
                <Stack
                  direction="row"
                  gap={1}
                  flexWrap="wrap"
                  sx={{ mt: 2 }}
                  data-testid="book-promotions"
                >
                  {data.promotions.map((p) => (
                    <Tooltip key={p.id} title={p.description || p.code}>
                      <Label
                        variant="soft"
                        color={MappingType[p.type].color}
                        startIcon={<Iconify icon={MappingType[p.type].icon} />}
                        sx={{ textTransform: 'none', height: 28, fontSize: 13 }}
                      >
                        {p.name}
                      </Label>
                    </Tooltip>
                  ))}
                </Stack>
              )}

              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mt: 2, color: 'text.secondary' }}
              >
                <Iconify
                  icon="solar:delivery-bold-duotone"
                  width={22}
                  sx={{ color: atInk('sky') }}
                />
                <Typography variant="body2">
                  {freeShipPromo
                    ? t('bookstore.detail.freeShipping')
                    : t('bookstore.detail.freeShipHint', {
                        amount: formatVnd(FREE_SHIP_THRESHOLD),
                      })}
                </Typography>
              </Stack>

              <Divider sx={{ my: 2.5, borderStyle: 'dashed' }} />

              {/* Ô số lượng + 2 nút; thiếu chỗ thì hàng nút xuống dòng dưới, chữ nút không bị bẻ đôi */}
              <Stack direction="row" flexWrap="wrap" useFlexGap gap={1.5} alignItems="center">
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mr: 'auto' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('bookstore.detail.quantity')}
                  </Typography>
                  <QuantityInput
                    value={qty}
                    onChange={setQty}
                    disabled={unavailable}
                    testId="book-qty"
                  />
                </Stack>
                <Stack
                  direction="row"
                  gap={1.5}
                  sx={{
                    flex: '1 1 320px',
                    maxWidth: 420,
                    '& .MuiButton-root': { flex: 1, whiteSpace: 'nowrap' },
                  }}
                >
                  <Button
                    size="large"
                    variant="outlined"
                    color="primary"
                    disabled={unavailable || !cartBook}
                    data-testid="book-add-to-cart"
                    startIcon={<Iconify icon="solar:cart-plus-bold" />}
                    onClick={() => cartBook && addToCart(cartBook, qty)}
                    sx={{ borderWidth: 1.5 }}
                  >
                    {t('bookstore.detail.addToCart')}
                  </Button>
                  <Button
                    size="large"
                    variant="contained"
                    color="secondary"
                    disabled={unavailable || !cartBook}
                    data-testid="book-buy-now"
                    startIcon={<Iconify icon="solar:bag-check-bold-duotone" />}
                    onClick={() => {
                      if (cartBook && addToCart(cartBook, qty)) router.push('/checkout');
                    }}
                  >
                    {t('bookstore.detail.buyNow')}
                  </Button>
                </Stack>
              </Stack>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {previewBlocks.length > 0 && (
                <Button
                  variant="contained"
                  color="info"
                  data-testid="book-read-sample"
                  startIcon={<Iconify icon="solar:book-2-bold-duotone" />}
                  onClick={() => setReaderOpen(true)}
                >
                  {t('bookstore.detail.readSample')}
                </Button>
              )}
              <Button
                color="inherit"
                variant="outlined"
                data-testid="book-copy-link"
                startIcon={<Iconify icon="solar:link-circle-line-duotone" />}
                onClick={() => copy(window.location.href)}
              >
                {t('bookstore.detail.copyLink')}
              </Button>
              {auth && data.id && (
                <Button
                  color="inherit"
                  variant="outlined"
                  data-testid="book-edit"
                  startIcon={<Iconify icon="solar:pen-bold" />}
                  component={RouterLink}
                  href={`/book-management/handle?name=Modify-book&id=${data.id}`}
                >
                  {t('bookstore.detail.edit')}
                </Button>
              )}
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      {/* Giới thiệu, đọc thử, thông số */}
      <Grid container spacing={{ xs: 4, md: 6 }} sx={{ mt: { xs: 2, md: 4 } }}>
        <Grid size={{ xs: 12, md: 7.5 }}>
          <Box component="section" data-testid="book-about">
            <SectionTitle>{t('bookstore.detail.about')}</SectionTitle>
            <Typography
              color="text.secondary"
              data-testid="book-description"
              sx={{ whiteSpace: 'pre-line', textAlign: 'justify', fontSize: 17, lineHeight: 1.8 }}
            >
              {data.description || t('bookstore.detail.noDescription')}
            </Typography>
          </Box>

          <Box component="section" data-testid="book-sample" sx={{ mt: 5 }}>
            <SectionTitle>{t('bookstore.detail.sampleTitle')}</SectionTitle>
            {previewBlocks.length > 0 ? (
              <Box
                sx={{
                  position: 'relative',
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  bgcolor: 'var(--at-paper)',
                  color: 'var(--at-paper-ink)',
                  border: '1px solid var(--at-line)',
                  fontFamily: "'Merriweather Variable', Georgia, serif",
                }}
              >
                <Typography sx={{ fontFamily: 'inherit', fontWeight: 800, fontSize: 19, mb: 2 }}>
                  {data.previewTitle || t('bookstore.reader.title')}
                </Typography>
                <Box sx={{ maxHeight: 210, overflow: 'hidden', position: 'relative' }}>
                  {previewBlocks
                    .filter((b) => b.type === 'paragraph')
                    .slice(0, 2)
                    .map((b, i) => (
                      <Box
                        key={i}
                        component="p"
                        sx={{
                          m: 0,
                          mb: 1.5,
                          lineHeight: 1.85,
                          fontSize: 16.5,
                          textAlign: 'justify',
                        }}
                      >
                        {b.text}
                      </Box>
                    ))}
                  <Box
                    aria-hidden
                    sx={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: 90,
                      background: 'linear-gradient(180deg, transparent, var(--at-paper))',
                    }}
                  />
                </Box>
                <Button
                  variant="contained"
                  color="info"
                  data-testid="book-continue-reading"
                  endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
                  onClick={() => setReaderOpen(true)}
                  sx={{ mt: 2 }}
                >
                  {t('bookstore.detail.continueReading')}
                </Button>
              </Box>
            ) : (
              <Typography color="text.secondary" data-testid="book-no-preview">
                {t('bookstore.detail.noPreview')}
              </Typography>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4.5 }}>
          <Box
            component="section"
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid var(--at-line)',
              boxShadow: 'var(--at-shadow)',
              bgcolor: 'background.paper',
            }}
          >
            <SectionTitle>{t('bookstore.detail.specs')}</SectionTitle>
            <Box
              component="dl"
              data-testid="book-more-info"
              sx={{
                m: 0,
                display: 'grid',
                gridTemplateColumns: 'max-content 1fr',
                columnGap: 2,
                rowGap: 1.5,
                typography: 'body2',
                '& dt': { color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 },
                '& dd': { m: 0, wordBreak: 'break-word', fontWeight: 600 },
              }}
            >
              {moreInfo.map(([key, value, icon]) => (
                <Fragment key={key}>
                  <dt>
                    <Iconify icon={icon} width={18} sx={{ color: 'text.disabled' }} />
                    {t(`book.moreInfo.${key}`)}
                  </dt>
                  <dd data-testid={`book-${key}`}>
                    {value}
                    {key === 'isbn' && (
                      <Tooltip title={t('bookstore.detail.copyIsbn')}>
                        <IconButton
                          size="small"
                          aria-label={t('bookstore.detail.copyIsbn')}
                          onClick={() => copy(String(value))}
                          sx={{ ml: 0.5, my: -0.5 }}
                        >
                          <Iconify icon="solar:copy-bold-duotone" width={16} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </dd>
                </Fragment>
              ))}
              {data.createdAt && (
                <>
                  <dt>
                    <Iconify
                      icon="solar:clock-circle-outline"
                      width={18}
                      sx={{ color: 'text.disabled' }}
                    />
                    {t('bookstore.detail.createdAt')}
                  </dt>
                  <dd data-testid="book-createdAt">{dayjs(data.createdAt).format('DD/MM/YYYY')}</dd>
                </>
              )}
            </Box>

            {data.auth && (
              <>
                <Divider sx={{ my: 2.5, borderStyle: 'dashed' }} />
                <Typography variant="overline" color="text.secondary">
                  {t('bookstore.detail.uploadedBy')}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{ mt: 1 }}
                  data-testid="book-uploader"
                >
                  <Avatar src={formatFilePath(data.auth.avatarUrl)} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap>
                      {data.auth.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {data.auth.email}
                    </Typography>
                  </Box>
                </Stack>
              </>
            )}
          </Box>
        </Grid>
      </Grid>

      <RelatedBooks bookId={data.id} category={firstCategory} />

      {data.previewContent && (
        <BookReader
          open={readerOpen}
          onClose={() => setReaderOpen(false)}
          bookName={data.name ?? ''}
          author={data.author}
          title={data.previewTitle}
          content={data.previewContent}
          endAction={
            !unavailable &&
            cartBook && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Iconify icon="solar:cart-plus-bold" />}
                onClick={() => {
                  addToCart(cartBook, 1);
                  setReaderOpen(false);
                }}
              >
                {t('bookstore.detail.addToCart')}
              </Button>
            )
          }
        />
      )}
    </DashboardContent>
  );
}
