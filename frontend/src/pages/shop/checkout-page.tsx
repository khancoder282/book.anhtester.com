import type { IconifyName } from 'src/components/iconify';

import { useForm, Controller } from 'react-hook-form';
import { useMemo, useState, useEffect, useCallback } from 'react';

import {
  Box,
  Grid,
  Card,
  Step,
  Radio,
  Stack,
  Alert,
  Button,
  Stepper,
  StepLabel,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { useRequest } from 'src/hooks/use-request';

import { useCart } from 'src/store/cart';
import { useAuth } from 'src/store/auth';
import { CONFIG } from 'src/config-global';
import { useTranslate } from 'src/locales';
import { atBg, atInk } from 'src/theme/at-tones';
import { DashboardContent } from 'src/layouts/dashboard';

import Title from 'src/components/title';
import { toast } from 'src/components/toast';
import { Iconify } from 'src/components/iconify';

import { EmptyCart } from './cart-page';
import { useQuote } from './hooks/use-quote';
import { CartLines } from './components/cart-lines';
import { formatVnd } from '../book-mgt/utils/pricing';
import { OrderSummary } from './components/order-summary';
import { OrderApi, getAddressWards, getAddressProvinces } from './api/order';

import type { Order, PaymentMethod } from './api/order';

// ----------------------------------------------------------------------

type AddressForm = {
  recipientName: string;
  phone: string;
  province: string | null;
  ward: string | null;
  street: string;
  note: string;
  paymentMethod: PaymentMethod;
};

/** Cùng luật với backend (order-controller): số di động VN, cho phép khoảng trắng / dấu chấm / gạch. */
const PHONE_RE = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
const normalizePhone = (v: string) => v.replace(/[\s.-]/g, '');

/**
 * Địa chỉ trong hồ sơ lưu dạng "<số nhà>, <phường>, <tỉnh>" (xem memory/features/address.md), nhưng có
 * thể thiếu phần (VD chỉ có tỉnh). Chỉ nhận tỉnh / phường khi đúng tiền tố loại đơn vị hành chính.
 */
function splitProfileAddress(address?: string | null) {
  const parts = (address ?? '')
    .split(', ')
    .map((p) => p.trim())
    .filter(Boolean);
  const province = /^(Thành phố|Tỉnh) /.test(parts[parts.length - 1] ?? '') ? parts.pop()! : null;
  const ward =
    province && /^(Phường|Xã|Đặc khu) /.test(parts[parts.length - 1] ?? '') ? parts.pop()! : null;
  return { province, ward, street: parts.join(', ') };
}

const STEP_KEYS = ['cart', 'address', 'confirm', 'done'] as const;

const PAYMENTS: { value: PaymentMethod; icon: IconifyName; tone: 'green' | 'blue' }[] = [
  { value: 'COD', icon: 'solar:wallet-money-bold', tone: 'green' },
  { value: 'BANK_TRANSFER', icon: 'solar:card-transfer-bold', tone: 'blue' },
];

export default function CheckoutPage() {
  const { t } = useTranslate();
  const { auth, checked } = useAuth();
  const clearCart = useCart((s) => s.clear);
  const { items, quote, loading } = useQuote();
  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<Order>();
  const [cartError, setCartError] = useState(false);

  const form = useForm<AddressForm>({
    mode: 'onTouched',
    defaultValues: {
      recipientName: '',
      phone: '',
      province: null,
      ward: null,
      street: '',
      note: '',
      paymentMethod: 'COD',
    },
  });
  const { control, handleSubmit, watch, setValue, reset, setError, getValues } = form;
  const province = watch('province');

  // Điền sẵn từ hồ sơ khi đã đăng nhập
  useEffect(() => {
    if (!auth) return;
    const user = auth as unknown as User;
    const addr = splitProfileAddress(user.address);
    reset((prev) => ({
      ...prev,
      recipientName: prev.recipientName || user.name || '',
      phone: prev.phone || user.phone || '',
      province: prev.province ?? addr.province,
      ward: prev.ward ?? addr.ward,
      street: prev.street || addr.street,
    }));
  }, [auth, reset]);

  const { data: provinces = [] } = useRequest(useCallback(() => getAddressProvinces(), []));
  const { data: wards = [] } = useRequest(
    useCallback(
      () => (province ? getAddressWards(province) : Promise.resolve([] as string[])),
      [province]
    )
  );

  const steps = useMemo(() => STEP_KEYS.map((k) => t(`shop.checkout.steps.${k}`)), [t]);

  const placeOrder = handleSubmit(async (values) => {
    setPlacing(true);
    setCartError(false);
    try {
      const res = await OrderApi.place({
        items: items.map((i) => ({ bookId: i.bookId, quantity: i.quantity })),
        recipientName: values.recipientName.trim(),
        phone: normalizePhone(values.phone),
        province: values.province ?? '',
        ward: values.ward ?? '',
        street: values.street.trim(),
        note: values.note.trim() || null,
        paymentMethod: values.paymentMethod,
      });
      setPlaced(res.order);
      clearCart();
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      const data = err?.response?.data;
      const fields: Record<string, string[]> = data?.fields ?? {};
      if (fields.items) {
        setCartError(true);
        setStep(0);
      }
      (['recipientName', 'phone', 'province', 'ward', 'street', 'note'] as const).forEach((f) => {
        if (fields[f]?.length) setError(f, { message: fields[f].join(' ') });
      });
      if (Object.keys(fields).some((f) => f !== 'items')) setStep(1);
      toast.error(data?.msg ?? 'Error');
    } finally {
      setPlacing(false);
    }
  });

  const summary = (children?: React.ReactNode) => (
    <OrderSummary
      subtotal={quote?.subtotal ?? 0}
      discount={quote?.discount ?? 0}
      shippingFee={quote?.shippingFee ?? 0}
      total={quote?.total ?? 0}
      freeShipThreshold={quote?.freeShipThreshold}
      freeShipping={quote?.freeShipping}
      loading={loading}
    >
      {children}
    </OrderSummary>
  );

  // ---------------------------------------------------------------- Hoàn tất
  if (step === 3 && placed) {
    return (
      <DashboardContent>
        <Title>{`${t('shop.success.title')} - ${CONFIG.appName}`}</Title>
        <Stepper activeStep={3} alternativeLabel sx={{ mb: 5 }}>
          {steps.map((label) => (
            <Step key={label} completed>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Card
          sx={{ maxWidth: 640, mx: 'auto', p: { xs: 3, md: 5 }, textAlign: 'center' }}
          data-testid="checkout-success"
        >
          <Box
            sx={{
              mx: 'auto',
              mb: 3,
              width: 96,
              height: 96,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '50%',
              color: '#fff',
              backgroundImage: 'var(--at-grad-green)',
              boxShadow: '0 12px 30px -8px rgba(38,138,36,.55)',
            }}
          >
            <Iconify icon="solar:check-circle-bold" width={56} />
          </Box>
          <Typography variant="h4" component="h1" sx={{ mb: 1.5 }}>
            {t('shop.success.title')}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {t('shop.success.text', { name: placed.recipientName, code: placed.code })}
          </Typography>
          <Stack
            spacing={1.25}
            sx={{ p: 2.5, mb: 3, borderRadius: 2, bgcolor: 'var(--at-sunken)', textAlign: 'left' }}
          >
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">{t('shop.success.code')}</Typography>
              <Typography
                data-testid="success-order-code"
                sx={{ fontWeight: 800, letterSpacing: '.05em' }}
              >
                {placed.code}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">{t('shop.success.total')}</Typography>
              <Typography
                data-testid="success-order-total"
                sx={{ fontWeight: 800, color: atInk('orange') }}
              >
                {formatVnd(placed.total)}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">{t('shop.success.payment')}</Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {t(`shop.orders.paymentMethod.${placed.paymentMethod}`)}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={RouterLink}
              href={`/orders/${placed.code}`}
              data-testid="success-view-order"
            >
              {t('shop.success.viewOrder')}
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              component={RouterLink}
              href="/book-management"
            >
              {t('shop.success.continueShopping')}
            </Button>
          </Stack>
        </Card>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <Title>{`${t('shop.checkout.title')} - ${CONFIG.appName}`}</Title>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        {t('shop.checkout.title')}
      </Typography>

      <Stepper activeStep={step} alternativeLabel sx={{ mb: 5 }} data-testid="checkout-stepper">
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Bước 1: giỏ hàng */}
            {step === 0 && (
              <Card sx={{ px: 3, py: 1 }} data-testid="checkout-step-cart">
                {cartError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {t('shop.checkout.cartChanged')}
                  </Alert>
                )}
                <CartLines quote={quote} />
              </Card>
            )}

            {/* Bước 2: địa chỉ + thanh toán */}
            {step === 1 &&
              (!auth ? (
                <Card sx={{ p: 4, textAlign: 'center' }} data-testid="checkout-sign-in">
                  <Iconify
                    icon="solar:lock-keyhole-bold"
                    width={48}
                    sx={{ color: 'text.disabled', mb: 2 }}
                  />
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    {t('shop.checkout.signInTitle')}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    {t('shop.checkout.signInText')}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={!checked}
                    component={RouterLink}
                    href="/sign-in?redirect=/checkout"
                  >
                    {t('shop.checkout.signIn')}
                  </Button>
                </Card>
              ) : (
                <Card sx={{ p: 3 }} data-testid="checkout-step-address">
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    {t('shop.checkout.steps.address')}
                  </Typography>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        control={control}
                        name="recipientName"
                        rules={{
                          validate: (v) => !!v.trim() || t('shop.checkout.validation.required'),
                          maxLength: {
                            value: 191,
                            message: t('shop.checkout.validation.maxLength', { max: 191 }),
                          },
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            fullWidth
                            required
                            label={t('shop.checkout.recipientName')}
                            inputProps={{ 'data-testid': 'checkout-recipient-name' }}
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        control={control}
                        name="phone"
                        rules={{
                          validate: (v) =>
                            !v.trim()
                              ? t('shop.checkout.validation.required')
                              : PHONE_RE.test(normalizePhone(v)) ||
                                t('shop.checkout.validation.phone'),
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            fullWidth
                            required
                            type="tel"
                            label={t('shop.checkout.phone')}
                            inputProps={{ 'data-testid': 'checkout-phone' }}
                            error={!!error}
                            helperText={error?.message ?? t('shop.checkout.phoneHelper')}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        control={control}
                        name="province"
                        rules={{ required: t('shop.checkout.validation.required') }}
                        render={({ field, fieldState: { error } }) => (
                          <Autocomplete
                            options={provinces}
                            value={field.value}
                            onChange={(_, v) => {
                              field.onChange(v);
                              setValue('ward', null);
                            }}
                            onBlur={field.onBlur}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                required
                                label={t('shop.checkout.province')}
                                inputProps={{
                                  ...params.inputProps,
                                  'data-testid': 'checkout-province',
                                }}
                                error={!!error}
                                helperText={error?.message}
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        control={control}
                        name="ward"
                        rules={{ required: t('shop.checkout.validation.required') }}
                        render={({ field, fieldState: { error } }) => (
                          <Autocomplete
                            options={wards}
                            disabled={!province}
                            value={field.value}
                            onChange={(_, v) => field.onChange(v)}
                            onBlur={field.onBlur}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                required
                                label={t('shop.checkout.ward')}
                                inputProps={{
                                  ...params.inputProps,
                                  'data-testid': 'checkout-ward',
                                }}
                                error={!!error}
                                helperText={error?.message}
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={12}>
                      <Controller
                        control={control}
                        name="street"
                        rules={{
                          validate: (v) => !!v.trim() || t('shop.checkout.validation.required'),
                          maxLength: {
                            value: 255,
                            message: t('shop.checkout.validation.maxLength', { max: 255 }),
                          },
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            fullWidth
                            required
                            label={t('shop.checkout.street')}
                            inputProps={{ 'data-testid': 'checkout-street' }}
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={12}>
                      <Controller
                        control={control}
                        name="note"
                        rules={{
                          maxLength: {
                            value: 1000,
                            message: t('shop.checkout.validation.maxLength', { max: 1000 }),
                          },
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            fullWidth
                            multiline
                            minRows={2}
                            label={t('shop.checkout.note')}
                            inputProps={{ 'data-testid': 'checkout-note' }}
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>

                  <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                    {t('shop.checkout.payment')}
                  </Typography>
                  <Controller
                    control={control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} role="radiogroup">
                        {PAYMENTS.map((p) => {
                          const active = field.value === p.value;
                          return (
                            <Box
                              key={p.value}
                              component="label"
                              data-testid={`checkout-payment-${p.value}`}
                              sx={{
                                flex: 1,
                                p: 2,
                                gap: 1.5,
                                display: 'flex',
                                alignItems: 'flex-start',
                                borderRadius: 2,
                                border: '1.5px solid',
                                borderColor: active ? 'primary.light' : 'var(--at-line)',
                                bgcolor: active ? atBg('green') : 'background.paper',
                                boxShadow: active ? '0 0 0 3px rgba(66,188,64,.16)' : 'none',
                                transition: 'all .15s',
                              }}
                            >
                              <Radio
                                checked={active}
                                onChange={() => field.onChange(p.value)}
                                value={p.value}
                                sx={{ p: 0, mt: 0.25 }}
                              />
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  flexShrink: 0,
                                  display: 'grid',
                                  placeItems: 'center',
                                  borderRadius: 1.5,
                                  color: atInk(p.tone),
                                  bgcolor: atBg(p.tone),
                                }}
                              >
                                <Iconify icon={p.icon} width={24} />
                              </Box>
                              <Box>
                                <Typography sx={{ fontWeight: 700 }}>
                                  {p.value === 'COD'
                                    ? t('shop.checkout.cod')
                                    : t('shop.checkout.bank')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {p.value === 'COD'
                                    ? t('shop.checkout.codHint')
                                    : t('shop.checkout.bankHint')}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </Stack>
                    )}
                  />
                </Card>
              ))}

            {/* Bước 3: xác nhận */}
            {step === 2 && (
              <Stack spacing={3} data-testid="checkout-step-confirm">
                <Card sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" sx={{ mb: 1.5 }}>
                    <Iconify
                      icon="solar:map-point-bold"
                      width={22}
                      sx={{ color: atInk('red'), mr: 1 }}
                    />
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {t('shop.checkout.shipTo')}
                    </Typography>
                    <Button size="small" onClick={() => setStep(1)}>
                      {t('shop.checkout.edit')}
                    </Button>
                  </Stack>
                  <Typography sx={{ fontWeight: 700 }} data-testid="confirm-recipient">
                    {getValues('recipientName')} · {normalizePhone(getValues('phone'))}
                  </Typography>
                  <Typography color="text.secondary" data-testid="confirm-address">
                    {[getValues('street'), getValues('ward'), getValues('province')]
                      .filter(Boolean)
                      .join(', ')}
                  </Typography>
                  {getValues('note') && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1, fontStyle: 'italic' }}
                    >
                      “{getValues('note')}”
                    </Typography>
                  )}
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
                    <Iconify
                      icon="solar:wallet-money-bold"
                      width={20}
                      sx={{ color: 'text.disabled' }}
                    />
                    <Typography variant="body2" data-testid="confirm-payment">
                      {getValues('paymentMethod') === 'COD'
                        ? t('shop.checkout.cod')
                        : t('shop.checkout.bank')}
                    </Typography>
                  </Stack>
                </Card>
                <Card sx={{ px: 3, py: 1 }}>
                  <Stack direction="row" alignItems="center" sx={{ pt: 2 }}>
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {t('shop.checkout.items')}
                    </Typography>
                    <Button size="small" onClick={() => setStep(0)}>
                      {t('shop.checkout.edit')}
                    </Button>
                  </Stack>
                  <CartLines quote={quote} readOnly />
                </Card>
                <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
                  {t('shop.checkout.agree')}
                </Alert>
              </Stack>
            )}

            {/* Điều hướng giữa các bước */}
            <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
              {step === 0 ? (
                <Button
                  color="inherit"
                  component={RouterLink}
                  href="/cart"
                  startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
                >
                  {t('shop.cart.title')}
                </Button>
              ) : (
                <Button
                  color="inherit"
                  data-testid="checkout-back"
                  onClick={() => setStep((s) => s - 1)}
                  startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
                >
                  {t('shop.checkout.back')}
                </Button>
              )}
              <Box sx={{ flex: 1 }} />
              {step === 0 && (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  data-testid="checkout-next"
                  disabled={!quote?.canCheckout || loading}
                  onClick={() => setStep(1)}
                  endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
                >
                  {t('shop.checkout.next')}
                </Button>
              )}
              {step === 1 && auth && (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  data-testid="checkout-next"
                  onClick={() => form.trigger().then((ok) => ok && setStep(2))}
                  endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
                >
                  {t('shop.checkout.next')}
                </Button>
              )}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>
              {summary(
                step === 2 && (
                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    color="secondary"
                    data-testid="checkout-place-order"
                    disabled={placing || loading || !quote?.canCheckout}
                    onClick={placeOrder}
                    startIcon={<Iconify icon="solar:bag-check-bold-duotone" />}
                  >
                    {placing ? t('shop.checkout.placing') : t('shop.checkout.placeOrder')}
                  </Button>
                )
              )}
            </Box>
          </Grid>
        </Grid>
      )}
    </DashboardContent>
  );
}
