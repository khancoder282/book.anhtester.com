import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales';
import { useCartCount } from 'src/store/cart';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/** Nút giỏ hàng trên header: số trên huy hiệu = tổng số cuốn trong giỏ (giỏ lưu ở trình duyệt). */
export function CartButton() {
  const { t } = useTranslate();
  const count = useCartCount();

  return (
    <Tooltip title={t('nav.openCart')}>
      <IconButton
        component={RouterLink}
        href="/cart"
        aria-label={t('nav.openCart')}
        data-testid="header-cart"
      >
        <Badge
          badgeContent={count}
          max={99}
          data-testid="header-cart-count"
          sx={{
            '& .MuiBadge-badge': {
              color: '#fff',
              fontWeight: 700,
              backgroundImage: 'var(--at-grad-orange)',
              boxShadow: 'var(--at-glow-orange)',
            },
          }}
        >
          <Iconify icon="solar:cart-large-minimalistic-bold-duotone" width={26} />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}
