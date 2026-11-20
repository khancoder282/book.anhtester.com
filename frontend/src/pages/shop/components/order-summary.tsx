import { Box, Stack, Divider, Typography, LinearProgress } from '@mui/material';

import { useTranslate } from 'src/locales';
import { atInk } from 'src/theme/at-tones';

import { Iconify } from 'src/components/iconify';

import { formatVnd } from '../../book-mgt/utils/pricing';

// ----------------------------------------------------------------------

type OrderSummaryProps = {
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  /** Có thì hiện thanh "mua thêm X để miễn phí vận chuyển" */
  freeShipThreshold?: number;
  freeShipping?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
};

function Row({
  label,
  value,
  testId,
  color,
}: {
  label: string;
  value: string;
  testId: string;
  color?: string;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography color="text.secondary">{label}</Typography>
      <Typography data-testid={testId} sx={{ fontWeight: 600, color }}>
        {value}
      </Typography>
    </Stack>
  );
}

/** Khung tóm tắt tiền: tạm tính, tiết kiệm, phí vận chuyển, tổng — dùng ở giỏ hàng, thanh toán, chi tiết đơn. */
export function OrderSummary({
  subtotal,
  discount,
  shippingFee,
  total,
  freeShipThreshold,
  freeShipping,
  loading,
  children,
}: OrderSummaryProps) {
  const { t } = useTranslate();
  const left = freeShipThreshold ? Math.max(freeShipThreshold - subtotal, 0) : 0;

  return (
    <Box
      data-testid="order-summary"
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: '1px solid var(--at-line)',
        boxShadow: 'var(--at-shadow)',
        opacity: loading ? 0.7 : 1,
        transition: 'opacity .2s',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('shop.summary.title')}
      </Typography>
      <Stack spacing={1.25}>
        <Row
          label={t('shop.summary.subtotal')}
          value={formatVnd(subtotal)}
          testId="summary-subtotal"
        />
        {discount > 0 && (
          <Row
            label={t('shop.summary.discount')}
            value={`-${formatVnd(discount)}`}
            testId="summary-discount"
            color={atInk('green')}
          />
        )}
        <Row
          label={t('shop.summary.shipping')}
          value={shippingFee === 0 ? t('shop.summary.free') : formatVnd(shippingFee)}
          testId="summary-shipping"
          color={shippingFee === 0 ? atInk('green') : undefined}
        />
      </Stack>

      {freeShipThreshold ? (
        <Box
          data-testid="summary-freeship"
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'var(--at-sky-bg)',
            color: 'var(--at-sky-ink)',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="solar:delivery-bold-duotone" width={22} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {freeShipping || left === 0
                ? t('shop.summary.freeShipReached')
                : t('shop.summary.freeShipLeft', { amount: formatVnd(left) })}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={freeShipping ? 100 : Math.min((subtotal / freeShipThreshold) * 100, 100)}
            sx={{
              mt: 1,
              height: 6,
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,.6)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                backgroundImage: 'var(--at-grad-sky)',
              },
            }}
          />
        </Box>
      ) : null}

      <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
      <Stack direction="row" justifyContent="space-between" alignItems="baseline">
        <Typography variant="subtitle1">{t('shop.summary.total')}</Typography>
        <Typography
          data-testid="summary-total"
          sx={{ fontSize: 26, fontWeight: 800, color: atInk('orange') }}
        >
          {formatVnd(total)}
        </Typography>
      </Stack>
      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ display: 'block', textAlign: 'right' }}
      >
        {t('shop.summary.vatNote')}
      </Typography>

      {children && <Box sx={{ mt: 2.5 }}>{children}</Box>}
    </Box>
  );
}
