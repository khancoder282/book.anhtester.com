import { useWatch } from 'react-hook-form';
import { useMemo, useState, useCallback } from 'react';

import {
  Box,
  Card,
  Chip,
  Stack,
  Avatar,
  Divider,
  Collapse,
  CardHeader,
  IconButton,
  Typography,
} from '@mui/material';

import { useRequest } from 'src/hooks/use-request';

import { MappingType } from 'src/pages/promotions-mgt/const-type';
import { getPromotion } from 'src/pages/promotions-mgt/api/get-promotion';

import { Iconify } from 'src/components/iconify';
import { useTable } from 'src/components/grid-view/hook/use-table';
import { TableView } from 'src/components/grid-view/components/table-view';
import { TableFilterView } from 'src/components/grid-view/components/table-filter-view';
import { TablePaginationView } from 'src/components/grid-view/components/table-pagination-view';

import { fields, columns } from '../columns-promotion';
import { control, setValue } from '../stores/form-add';

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

function handlePrice(price: number, promotions: PromotionType[]) {
  let pricePromotion = 0;
  promotions.forEach((p) => {
    if (p.type === 'PERCENTAGE') {
      pricePromotion += (price * p.value) / 100;
    }
    if (p.type === 'FIXED_AMOUNT') {
      pricePromotion += p.value;
    }
  });
  return price - pricePromotion;
}

export function CardPromotion() {
  const [expen, setExpen] = useState(false);
  const [selected = [], _price = 0] = useWatch({ control, name: ['promotions', 'price'] });
  const price = Number(_price || 0);
  const currentPrice = useMemo(() => handlePrice(price, selected), [price, selected]);

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
        title="Promotion"
        subheader="Select promotion"
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
          <TableFilterView config={config} filter={fields} />
          <TableView
            select={{
              selected,
              setSelected,
            }}
            config={config}
            columns={columns()}
            data={list}
            filter={fields}
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
              <Box p={2} display="flex" flexWrap="unset" gap={1}>
                {selected.map((item) => (
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
                    key={item.id}
                    label={
                      <>
                        <b>[item.code]</b> {item.name}
                      </>
                    }
                    onDelete={() => setSelected(selected.filter((i) => i.id !== item.id))}
                  />
                ))}
                {selected.length > 1 && (
                  <Chip
                    onClick={() => setSelected([])}
                    variant="outlined"
                    label={`Remove ${selected.length} promotions`}
                    sx={{ fontWeight: 'bold' }}
                  />
                )}
              </Box>
            </>
          )}
          <Box p={2}>
            <Typography variant="h6" color="textPrimary" position="relative" textAlign="right">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'vnd' }).format(
                currentPrice
              )}
              {currentPrice !== price && (
                <Typography
                  sx={{ textDecoration: 'line-through' }}
                  position="absolute"
                  bottom="100%"
                  right={0}
                  variant="body2"
                  color="textDisabled"
                  display="flex"
                  alignItems="center"
                >
                  <Iconify
                    sx={{ color: (t) => t.palette.success.main, mr: 0.5 }}
                    icon="eva:arrow-ios-downward-fill"
                    width={12}
                  />
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'vnd',
                  }).format(price)}
                </Typography>
              )}
            </Typography>
          </Box>
        </Stack>
      </Collapse>
    </Card>
  );
}
