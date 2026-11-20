import dayjs from 'dayjs';
import { useWatch } from 'react-hook-form';
import { useMemo, useState, useCallback } from 'react';

import {
  Box,
  Card,
  Chip,
  Alert,
  Stack,
  Avatar,
  Divider,
  Tooltip,
  Collapse,
  CardHeader,
  IconButton,
  Typography,
} from '@mui/material';

import { useRequest } from 'src/hooks/use-request';

import { useTranslate } from 'src/locales';
import { MappingType } from 'src/pages/promotions-mgt/const-type';
import { PROMOTION_STATUS_COLOR } from 'src/pages/promotions-mgt/utils';
import { getPromotion } from 'src/pages/promotions-mgt/api/get-promotion';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useTable } from 'src/components/grid-view/hook/use-table';
import { TableView } from 'src/components/grid-view/components/table-view';
import { TableFilterView } from 'src/components/grid-view/components/table-filter-view';
import { TablePaginationView } from 'src/components/grid-view/components/table-pagination-view';

import { fields, columns } from '../columns-promotion';
import { control, setValue } from '../stores/form-add';
import { PromotionDetailDialog } from './promotion-detail-dialog';
import {
  formatVnd,
  promotionStatus,
  calcCurrentPrice,
  calcUpcomingPrice,
  promotionDiscount,
} from '../utils/pricing';

function formatValue(str: string) {
  try {
    const rs = JSON.parse(str);
    if (['string', 'number'].includes(typeof rs)) throw new Error();
    return rs;
  } catch {
    return {
      OR: ['name', 'code'].map((key) => ({
        [key]: {
          contains: str,
        },
      })),
    };
  }
}

export function CardPromotion() {
  const { t } = useTranslate();
  const filterFields = useMemo(() => fields(t), [t]);
  const [expen, setExpen] = useState(false);
  const [viewing, setViewing] = useState<PromotionType | null>(null);
  const [selected = [], _price = 0] = useWatch({ control, name: ['promotions', 'price'] });
  const price = Number(_price || 0);
  const currentPrice = useMemo(() => calcCurrentPrice(price, selected), [price, selected]);
  const upcomingPrice = useMemo(() => calcUpcomingPrice(price, selected), [price, selected]);
  // Khuyến mãi đã chọn nhưng chưa được trừ vào giá bán (sắp chạy / hết hạn / đã tắt)
  const notApplied = selected.filter((p) => promotionStatus(p) !== 'running');

  const setSelected = (row: PromotionType[]) =>
    setValue('promotions', row, {
      shouldDirty: true,
    });

  const config = useTable<PromotionType>({
    order: 'createdAt',
    orderBy: 'desc',
    rowsPerPage: 5,
  });

  const {
    data: { list, pagination: { total } } = {
      list: [],
      pagination: { total: 0 },
    },
  } = useRequest(
    useCallback(() => {
      const filter = {
        AND: [
          {
            endDate: {
              gte: new Date().toISOString(),
            },
            isActive: true,
          },
          formatValue(config.filter),
        ],
      };

      return getPromotion({
        limit: config.rowsPerPage,
        page: config.page,
        search: JSON.stringify(filter),
        sortBy: config.orderBy,
        sort: config.order,
      });
    }, [config.filter, config.order, config.orderBy, config.page, config.rowsPerPage])
  );

  return (
    <Card>
      <CardHeader
        title={t('book.promotion.title')}
        subheader={t('book.promotion.subheader')}
        action={
          <IconButton onClick={() => setExpen(!expen)}>
            <Iconify
              sx={{ transition: 'all .1s ease-in-out' }}
              style={{ rotate: !expen ? '0deg' : '90deg' }}
              icon="eva:arrow-ios-forward-fill"
            />
          </IconButton>
        }
        sx={{ mb: 3 }}
      />
      <Collapse in={expen}>
        <Divider />
        <Stack>
          <TableFilterView config={config} filter={filterFields} />
          <TableView
            select={{
              selected,
              setSelected,
            }}
            config={config}
            columns={columns(t)}
            data={list}
            filter={filterFields}
            keyName="id"
          />
          <TablePaginationView
            total={total}
            config={config}
            rowsPerPageList={[5, 10, 15, 20, 25]}
          />
          {selected.length > 0 && (
            <>
              <Divider />
              <Box p={2} display="flex" flexWrap="wrap" gap={1}>
                {selected.map((item) => (
                  <Tooltip key={item.id} title={t('book.promotion.price.viewDetail')}>
                    <Chip
                      avatar={
                        <Avatar
                          sx={{
                            bgcolor: `${MappingType[item.type].color}.main`,
                            color: '#fff !important',
                          }}
                        >
                          <Iconify width={0.6} icon={MappingType[item.type].icon} />
                        </Avatar>
                      }
                      clickable
                      onClick={() => setViewing(item)}
                      data-testid={`selected-promotion-${item.code}`}
                      label={
                        <>
                          <b>[{item.code}]</b> {item.name}
                        </>
                      }
                      onDelete={() => setSelected(selected.filter((i) => i.id !== item.id))}
                    />
                  </Tooltip>
                ))}
                {selected.length > 1 && (
                  <Chip
                    onClick={() => setSelected([])}
                    variant="outlined"
                    label={t('book.promotion.removeAll', { count: selected.length })}
                    sx={{ fontWeight: 'bold' }}
                  />
                )}
              </Box>
            </>
          )}
          <Stack p={2} spacing={1} data-testid="promotion-price-summary">
            {selected.length > 0 && (
              <>
                <PriceRow label={t('book.promotion.price.original')} value={formatVnd(price)} />
                {selected.map((item) => {
                  const status = promotionStatus(item);
                  const discount = promotionDiscount(price, item);
                  const applied = status === 'running';
                  return (
                    <Stack
                      key={item.id}
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      data-testid={`promotion-price-row-${item.code}`}
                    >
                      <Tooltip title={t('book.promotion.price.viewDetail')}>
                        <Typography
                          component="button"
                          type="button"
                          variant="body2"
                          onClick={() => setViewing(item)}
                          sx={{
                            p: 0,
                            border: 0,
                            bgcolor: 'transparent',
                            cursor: 'pointer',
                            color: 'text.secondary',
                            textAlign: 'left',
                            textDecoration: 'underline dotted',
                            '&:hover': { color: 'primary.main' },
                          }}
                        >
                          [{item.code}] {item.name}
                        </Typography>
                      </Tooltip>
                      <Label color={PROMOTION_STATUS_COLOR[status]}>
                        {t(`promotion.status.${status}`)}
                      </Label>
                      <Box flex={1} />
                      <Typography
                        variant="body2"
                        noWrap
                        color={applied && discount > 0 ? 'success.main' : 'text.disabled'}
                        sx={{ textDecoration: applied || discount === 0 ? 'none' : 'line-through' }}
                      >
                        {discount > 0
                          ? `−${formatVnd(discount)}`
                          : t('book.promotion.price.noPriceChange')}
                      </Typography>
                    </Stack>
                  );
                })}
                <Divider sx={{ borderStyle: 'dashed' }} />
              </>
            )}
            <PriceRow
              label={t('book.promotion.price.current')}
              strike={currentPrice !== price ? formatVnd(price) : undefined}
              value={
                <Typography variant="h6" component="span" data-testid="promotion-current-price">
                  {formatVnd(currentPrice)}
                </Typography>
              }
            />
            {upcomingPrice !== currentPrice && (
              <PriceRow
                label={t('book.promotion.price.upcoming')}
                value={
                  <Typography
                    variant="subtitle1"
                    component="span"
                    color="info.main"
                    data-testid="promotion-upcoming-price"
                  >
                    {formatVnd(upcomingPrice)}
                  </Typography>
                }
              />
            )}
            {notApplied.length > 0 && (
              <Alert severity="warning" data-testid="promotion-not-applied-warning">
                {t('book.promotion.price.warning')}
                <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2 }}>
                  {notApplied.map((p) => (
                    <li key={p.id}>
                      <b>{p.code}</b>:{' '}
                      {t(`book.promotion.detail.notApplied.${promotionStatus(p)}`, {
                        date: dayjs(p.startDate).format('DD/MM/YYYY HH:mm'),
                      })}
                    </li>
                  ))}
                </Box>
              </Alert>
            )}
          </Stack>
        </Stack>
      </Collapse>
      <PromotionDetailDialog
        promotion={viewing}
        price={price}
        onClose={() => setViewing(null)}
        onRemove={(p) => setSelected(selected.filter((i) => i.id !== p.id))}
      />
    </Card>
  );
}

function PriceRow({
  label,
  value,
  strike,
}: {
  label: string;
  value: React.ReactNode;
  strike?: string;
}) {
  return (
    <Stack direction="row" alignItems="baseline" spacing={1}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Box flex={1} />
      {strike && (
        <Typography variant="body2" color="text.disabled" sx={{ textDecoration: 'line-through' }}>
          {strike}
        </Typography>
      )}
      <Box sx={{ typography: 'body2', textAlign: 'right' }}>{value}</Box>
    </Stack>
  );
}
