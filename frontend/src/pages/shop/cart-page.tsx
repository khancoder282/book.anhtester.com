import { Box, Grid, Card, Stack, Alert, Button, Typography } from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { useCart } from 'src/store/cart';
import { CONFIG } from 'src/config-global';
import { useTranslate } from 'src/locales';
import { DashboardContent } from 'src/layouts/dashboard';

import Title from 'src/components/title';
import { Iconify } from 'src/components/iconify';

import { useQuote } from './hooks/use-quote';
import { CartLines } from './components/cart-lines';
import { OrderSummary } from './components/order-summary';

// ----------------------------------------------------------------------

export function EmptyCart() {
  const { t } = useTranslate();
  return (
    <Stack
      alignItems="center"
      spacing={2}
      sx={{ py: 10, textAlign: 'center' }}
      data-testid="cart-empty"
    >
      <Box
        sx={{
          width: 120,
          height: 120,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          bgcolor: 'var(--at-sky-bg)',
          color: 'var(--at-sky-ink)',
        }}
      >
        <Iconify icon="solar:cart-large-minimalistic-bold-duotone" width={64} />
      </Box>
      <Typography variant="h5">{t('shop.cart.empty')}</Typography>
      <Typography color="text.secondary">{t('shop.cart.emptyHint')}</Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        component={RouterLink}
        href="/book-management"
        startIcon={<Iconify icon="solar:book-2-bold-duotone" />}
      >
        {t('shop.cart.browse')}
      </Button>
    </Stack>
  );
}

export default function CartPage() {
  const { t } = useTranslate();
  const clear = useCart((s) => s.clear);
  const { items, quote, loading, error } = useQuote();
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <DashboardContent maxWidth="xl">
      <Title>{`${t('shop.cart.title')} - ${CONFIG.appName}`}</Title>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ flex: 1 }}>
          {t('shop.cart.title')}
          {count > 0 && (
            <Typography
              component="span"
              color="text.secondary"
              sx={{ ml: 1.5, fontSize: 18, fontWeight: 500 }}
            >
              ({t('shop.cart.count', { count })})
            </Typography>
          )}
        </Typography>
        {items.length > 0 && (
          <Button
            color="error"
            data-testid="cart-clear"
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
            onClick={clear}
          >
            {t('shop.cart.removeAll')}
          </Button>
        )}
      </Stack>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ px: 3, py: 1 }}>
              {error && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {t('shop.cart.quoteError')}
                </Alert>
              )}
              <CartLines quote={quote} />
            </Card>
            <Button
              sx={{ mt: 2 }}
              color="inherit"
              component={RouterLink}
              href="/book-management"
              startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
            >
              {t('shop.cart.continueShopping')}
            </Button>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>
              <OrderSummary
                subtotal={quote?.subtotal ?? 0}
                discount={quote?.discount ?? 0}
                shippingFee={quote?.shippingFee ?? 0}
                total={quote?.total ?? 0}
                freeShipThreshold={quote?.freeShipThreshold}
                freeShipping={quote?.freeShipping}
                loading={loading}
              >
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  color="secondary"
                  data-testid="cart-checkout"
                  disabled={!quote?.canCheckout || loading}
                  component={RouterLink}
                  href="/checkout"
                  endIcon={<Iconify icon="solar:arrow-right-linear" />}
                >
                  {loading ? t('shop.cart.updating') : t('shop.cart.checkout')}
                </Button>
              </OrderSummary>
            </Box>
          </Grid>
        </Grid>
      )}
    </DashboardContent>
  );
}
