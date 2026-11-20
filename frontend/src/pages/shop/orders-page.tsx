import dayjs from 'dayjs';
import { useState, useCallback } from 'react';

import { Box, Tab, Card, Tabs, Stack, Button, Skeleton, Typography } from '@mui/material';

import { RouterLink } from 'src/routes/components';
import { useAuthCheck } from 'src/routes/hooks/use-auth-check';

import { useRequest } from 'src/hooks/use-request';

import { CONFIG } from 'src/config-global';
import { useTranslate } from 'src/locales';
import { atInk } from 'src/theme/at-tones';
import { DashboardContent } from 'src/layouts/dashboard';

import Title from 'src/components/title';
import { Iconify } from 'src/components/iconify';
import { PageHeader } from 'src/components/page-header/page-header';

import { OrderApi } from './api/order';
import { formatVnd } from '../book-mgt/utils/pricing';
import { BookCover } from '../book-mgt/components/book-cover';
import { OrderStatusPill } from './components/order-status-pill';

import type { OrderStatus } from './api/order';

// ----------------------------------------------------------------------

export default function OrdersPage() {
  const { t } = useTranslate();
  const { auth } = useAuthCheck();
  const [status, setStatus] = useState<OrderStatus | ''>('');

  const { data, loading } = useRequest(
    useCallback(
      () =>
        auth
          ? OrderApi.list({ page: 1, limit: 50, ...(status && { status }) })
          : Promise.resolve(undefined),
      [auth, status]
    )
  );
  const list = data?.list ?? [];

  return (
    <DashboardContent>
      <Title>{`${t('shop.orders.title')} - ${CONFIG.appName}`}</Title>
      <PageHeader
        icon="solar:bill-list-bold-duotone"
        tone="teal"
        title={t('shop.orders.title')}
        action={
          <Button
            variant="outlined"
            color="primary"
            component={RouterLink}
            href="/book-management"
            startIcon={<Iconify icon="solar:book-2-bold-duotone" />}
          >
            {t('shop.cart.browse')}
          </Button>
        }
      />

      <Tabs
        value={status}
        onChange={(_, v) => setStatus(v)}
        sx={{ mb: 3 }}
        data-testid="orders-status-tabs"
      >
        <Tab value="" label={t('shop.orders.all')} />
        <Tab value="PENDING" label={t('shop.orders.status.PENDING')} />
        <Tab value="CANCELLED" label={t('shop.orders.status.CANCELLED')} />
      </Tabs>

      {loading && !data ? (
        <Stack spacing={2}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={120} />
          ))}
        </Stack>
      ) : list.length === 0 ? (
        <Stack alignItems="center" spacing={2} sx={{ py: 8 }} data-testid="orders-empty">
          <Iconify
            icon="solar:bill-list-bold-duotone"
            width={72}
            sx={{ color: 'var(--at-teal-ink)', opacity: 0.6 }}
          />
          <Typography color="text.secondary">{t('shop.orders.empty')}</Typography>
        </Stack>
      ) : (
        <Stack spacing={2} data-testid="orders-list">
          {list.map((order) => (
            <Card
              key={order.id}
              component={RouterLink}
              href={`/orders/${order.code}`}
              data-testid={`order-${order.code}`}
              sx={{
                p: 2.5,
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'box-shadow .2s, border-color .2s',
                '&:hover': { borderColor: 'primary.lighter', boxShadow: 'var(--at-shadow-sm)' },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
                <Typography sx={{ fontWeight: 800, letterSpacing: '.04em' }}>
                  {order.code}
                </Typography>
                <OrderStatusPill status={order.status} />
                <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                  {t('shop.orders.placedAt', {
                    date: dayjs(order.createdAt).format('DD/MM/YYYY HH:mm'),
                  })}
                </Typography>
                <Typography sx={{ fontWeight: 800, fontSize: 19, color: atInk('orange') }}>
                  {formatVnd(order.total)}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
                {order.items.slice(0, 5).map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      width: 40,
                      borderRadius: '2px 5px 5px 2px',
                      overflow: 'hidden',
                      boxShadow: '1px 2px 6px rgba(15,23,42,.2)',
                    }}
                  >
                    <BookCover
                      src={item.picture ?? undefined}
                      name={item.name}
                      sx={{ aspectRatio: '2 / 3', p: 0, '& > *': { display: 'none' } }}
                    />
                  </Box>
                ))}
                <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
                  {t('shop.orders.itemsCount', {
                    count: order.items.reduce((s, i) => s + i.quantity, 0),
                  })}
                </Typography>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </DashboardContent>
  );
}
