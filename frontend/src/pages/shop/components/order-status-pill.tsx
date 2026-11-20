import { Box } from '@mui/material';

import { useTranslate } from 'src/locales';
import { atBg, atInk } from 'src/theme/at-tones';

import type { OrderStatus } from '../api/order';

/** Pill trạng thái đơn hàng (chấm màu + chữ) theo kiểu `.at-pill` của AT UI kit. */
export function OrderStatusPill({ status }: { status: OrderStatus }) {
  const { t } = useTranslate();
  const tone = status === 'CANCELLED' ? 'red' : 'green';
  return (
    <Box
      component="span"
      data-testid="order-status"
      sx={{
        px: 1.25,
        py: 0.4,
        gap: 0.75,
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        bgcolor: atBg(tone),
        color: atInk(tone),
        '&::before': {
          content: '""',
          width: 7,
          height: 7,
          borderRadius: '50%',
          bgcolor: 'currentColor',
        },
      }}
    >
      {t(`shop.orders.status.${status}`)}
    </Box>
  );
}
