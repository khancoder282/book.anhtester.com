import { Box, Stack, Alert, Tooltip, IconButton, Typography } from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales';
import { atInk } from 'src/theme/at-tones';
import { useCart, CART_MAX_QTY } from 'src/store/cart';

import { toast } from 'src/components/toast';
import { Iconify } from 'src/components/iconify';
import { QuantityInput } from 'src/components/quantity-input/quantity-input';

import { formatVnd } from '../../book-mgt/utils/pricing';
import { BookCover } from '../../book-mgt/components/book-cover';

import type { Quote, QuoteLine } from '../api/order';

// ----------------------------------------------------------------------

/** Ghép dòng trong giỏ (trình duyệt) với dòng báo giá của server theo id hoặc slug. */
export function findQuoteLine(
  quote: Quote | undefined,
  bookId: string,
  slug: string
): QuoteLine | undefined {
  return quote?.items.find((l) => l.bookId === bookId || (l.slug && l.slug === slug));
}

type CartLinesProps = {
  quote?: Quote;
  /** Chỉ xem (bước xác nhận): không đổi số lượng / xoá */
  readOnly?: boolean;
};

export function CartLines({ quote, readOnly }: CartLinesProps) {
  const { t } = useTranslate();
  const { items, setQuantity, remove } = useCart();

  return (
    <Stack
      divider={<Box sx={{ borderTop: '1px dashed var(--at-line)' }} />}
      data-testid="cart-lines"
    >
      {items.map((item) => {
        const line = findQuoteLine(quote, item.bookId, item.slug);
        const unavailable = line && !line.available;
        return (
          <Stack
            key={item.bookId}
            direction="row"
            spacing={2}
            alignItems="center"
            data-testid={`cart-line-${item.slug}`}
            sx={{ py: 2, opacity: unavailable ? 0.75 : 1 }}
          >
            <Box
              component={RouterLink}
              href={`/book-management/detail/${item.slug}`}
              sx={{
                width: readOnly ? 52 : 72,
                flexShrink: 0,
                borderRadius: '2px 6px 6px 2px',
                overflow: 'hidden',
                boxShadow: '2px 4px 10px -2px rgba(15,23,42,.25)',
              }}
            >
              <BookCover
                src={line?.picture ?? item.picture ?? undefined}
                name={line?.name || item.name}
                sx={{ aspectRatio: '2 / 3', p: 0.5, '& .MuiTypography-root': { fontSize: 10 } }}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                component={RouterLink}
                href={`/book-management/detail/${item.slug}`}
                data-testid="cart-line-name"
                sx={{
                  display: '-webkit-box',
                  overflow: 'hidden',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  fontWeight: 700,
                  color: 'text.primary',
                  textDecoration: 'none',
                  fontFamily: (theme) => theme.typography.fontSecondaryFamily,
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {line?.name || item.name}
              </Typography>
              {line?.available && (
                <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mt: 0.5 }}>
                  <Typography
                    variant="body2"
                    data-testid="cart-line-unit-price"
                    sx={{ fontWeight: 600 }}
                  >
                    {formatVnd(line.unitPrice)}
                  </Typography>
                  {line.price > line.unitPrice && (
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ textDecoration: 'line-through' }}
                    >
                      {formatVnd(line.price)}
                    </Typography>
                  )}
                  {readOnly && (
                    <Typography variant="body2" color="text.secondary">
                      × {item.quantity}
                    </Typography>
                  )}
                </Stack>
              )}
              {unavailable && (
                <Alert severity="error" sx={{ mt: 1, py: 0 }} data-testid="cart-line-error">
                  {line.error === 'Book not found.'
                    ? t('shop.cart.notFound')
                    : t('shop.cart.unavailable')}
                </Alert>
              )}
            </Box>

            {!readOnly && (
              <QuantityInput
                size="small"
                value={item.quantity}
                max={CART_MAX_QTY}
                disabled={!!unavailable}
                onChange={(q) => setQuantity(item.bookId, q)}
                testId={`cart-qty-${item.slug}`}
              />
            )}

            <Typography
              data-testid="cart-line-total"
              sx={{
                width: { xs: 'auto', sm: 120 },
                textAlign: 'right',
                fontWeight: 800,
                color: atInk('orange'),
              }}
            >
              {line?.available ? formatVnd(line.lineTotal) : '—'}
            </Typography>

            {!readOnly && (
              <Tooltip title={t('shop.cart.remove')}>
                <IconButton
                  aria-label={t('shop.cart.remove')}
                  data-testid={`cart-remove-${item.slug}`}
                  onClick={() => {
                    remove(item.bookId);
                    toast.info(t('shop.cart.removed', { name: item.name }));
                  }}
                  sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                >
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        );
      })}
    </Stack>
  );
}
