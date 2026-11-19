import dayjs from 'dayjs';

import {
  Box,
  Stack,
  Button,
  Dialog,
  Divider,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { useTranslate } from 'src/locales';
import { MappingType } from 'src/pages/promotions-mgt/const-type';
import { formatPromotionValue, PROMOTION_STATUS_COLOR } from 'src/pages/promotions-mgt/utils';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { formatVnd, promotionStatus, promotionDiscount } from '../utils/pricing';

type Props = {
  promotion: PromotionType | null;
  price: number;
  onClose: () => void;
  onRemove: (promotion: PromotionType) => void;
};

/** Hộp chi tiết chương trình khuyến mãi, mở khi bấm chip khuyến mãi đã chọn trong form sách. */
export function PromotionDetailDialog({ promotion, price, onClose, onRemove }: Props) {
  const { t } = useTranslate();
  if (!promotion) return null;

  const status = promotionStatus(promotion);
  const discount = promotionDiscount(price, promotion);
  const row = (label: string, value: React.ReactNode, testId: string) => (
    <Stack direction="row" spacing={2} alignItems="flex-start" data-testid={testId}>
      <Typography variant="body2" color="text.secondary" sx={{ width: 140, flexShrink: 0 }}>
        {label}
      </Typography>
      <Box sx={{ typography: 'body2', flex: 1, minWidth: 0, wordBreak: 'break-word' }}>{value}</Box>
    </Stack>
  );

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="promotion-detail-title"
      data-testid="promotion-detail-dialog"
    >
      <DialogTitle id="promotion-detail-title">
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <span>{t('book.promotion.detail.title')}</span>
          <Label color={PROMOTION_STATUS_COLOR[status]}>{t(`promotion.status.${status}`)}</Label>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
          {row(
            t('book.promotion.detail.code'),
            <Typography variant="subtitle2" textTransform="uppercase">
              {promotion.code}
            </Typography>,
            'promotion-detail-code'
          )}
          {row(t('book.promotion.detail.name'), promotion.name, 'promotion-detail-name')}
          {row(
            t('book.promotion.detail.description'),
            promotion.description || (
              <Typography variant="body2" color="text.disabled">
                {t('book.promotion.detail.noDescription')}
              </Typography>
            ),
            'promotion-detail-description'
          )}
          {row(
            t('book.promotion.detail.type'),
            <Label
              color={MappingType[promotion.type]?.color}
              startIcon={<Iconify icon={MappingType[promotion.type]?.icon} />}
            >
              {t(`promotion.type.${promotion.type}`)}
            </Label>,
            'promotion-detail-type'
          )}
          {row(
            t('book.promotion.detail.value'),
            formatPromotionValue(promotion),
            'promotion-detail-value'
          )}
          {row(
            t('book.promotion.detail.period'),
            `${dayjs(promotion.startDate).format('DD/MM/YYYY HH:mm')} → ${dayjs(promotion.endDate).format('DD/MM/YYYY HH:mm')}`,
            'promotion-detail-period'
          )}
          {row(
            t('book.promotion.detail.discount'),
            <Stack spacing={0.5}>
              <Typography
                variant="subtitle2"
                color={discount > 0 && status === 'running' ? 'success.main' : 'text.secondary'}
              >
                {discount > 0 ? `−${formatVnd(discount)}` : t('book.promotion.price.noPriceChange')}
              </Typography>
              {discount > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {formatVnd(price)} → {formatVnd(Math.max(price - discount, 0))}
                </Typography>
              )}
              {status !== 'running' && (
                <Typography variant="caption" color="warning.dark">
                  {t(`book.promotion.detail.notApplied.${status}`, {
                    date: dayjs(promotion.startDate).format('DD/MM/YYYY HH:mm'),
                  })}
                </Typography>
              )}
            </Stack>,
            'promotion-detail-discount'
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          color="inherit"
          href={`/promotion-book-management/handle?id=${promotion.id}`}
          target="_blank"
          rel="noopener"
          startIcon={<Iconify icon="solar:link-circle-line-duotone" />}
          sx={{ mr: 'auto' }}
        >
          {t('book.promotion.detail.openPage')}
        </Button>
        <Button
          color="error"
          onClick={() => {
            onRemove(promotion);
            onClose();
          }}
        >
          {t('book.promotion.detail.unselect')}
        </Button>
        <Button variant="contained" onClick={onClose}>
          {t('book.promotion.detail.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
