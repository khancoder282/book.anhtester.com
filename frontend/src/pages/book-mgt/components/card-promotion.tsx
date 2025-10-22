import { useWatch } from 'react-hook-form';
import { useMemo, useState, useCallback } from 'react';

import {
  Box,
  Card,
  Chip,
  Stack,
  Button,
  Dialog,
  Avatar,
  Divider,
  Tooltip,
  Collapse,
  TextField,
  CardHeader,
  IconButton,
  DialogTitle,
  InputAdornment,
} from '@mui/material';

import { useRequest } from 'src/hooks/use-request';

import { MappingType } from 'src/pages/promotions-mgt/const-type';
import { getPromotion } from 'src/pages/promotions-mgt/api/get-promotion';

import { Label } from 'src/components/label';
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
  const [open, setOpen] = useState(false);
  const [selected = [], price = 0] = useWatch({ control, name: ['promotions', 'price'] });

  const priceAfter = useMemo(() => handlePrice(Number(price || 0), selected), [price, selected]);

  const setSelected = (row: PromotionType[]) => setValue('promotions', row);

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
    <>
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
          <Stack spacing={1.5} p={3}>
            <TextField
              label="Price with promotion"
              sx={{ flex: 1 }}
              value={new Intl.NumberFormat('vi-VN').format(priceAfter)}
              helperText={
                selected.length > 0 &&
                `Decrease ${new Intl.NumberFormat('vi-VN').format(Number(price || 0) - priceAfter)}vnđ with ${selected.length} promotion`
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        sx={{ mr: -0.5 }}
                        variant="contained"
                        color="inherit"
                        onClick={() => setOpen(true)}
                        endIcon={
                          <Label sx={{ fontSize: '14px !important', color: '#fff' }}>
                            {selected.length}
                          </Label>
                        }
                      >
                        Apply promotion
                      </Button>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Box display="flex" flexWrap="wrap" gap={1}>
              {selected.map((item) => (
                <Chip
                  avatar={
                    <Avatar
                      sx={{
                        bgcolor: (t) => t.palette.Alert.warningIconColor,
                      }}
                    >
                      <Iconify
                        style={{ color: '#fff' }}
                        width={18}
                        icon={MappingType[item.type].icon}
                      />
                    </Avatar>
                  }
                  key={item.id}
                  sx={{
                    bgcolor: (t) => t.palette.Alert.warningStandardBg,
                  }}
                  label={
                    <>
                      <b>[{item.code}]</b> {item.name}
                    </>
                  }
                  onDelete={() => setSelected(selected.filter((i) => i.id !== item.id))}
                />
              ))}
            </Box>
          </Stack>
        </Collapse>
      </Card>
      <Dialog scroll="body" fullWidth maxWidth="lg" open={open}>
        <DialogTitle display="flex" alignItems="center">
          Search promotion{' '}
          <Tooltip arrow title={`Selected ${selected.length} promotion`}>
            <Label> {selected.length} </Label>
          </Tooltip>
          <Button
            sx={{ ml: 'auto' }}
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="mingcute:close-line" />}
            onClick={() => setOpen(false)}
            id="close-apply-promotion"
          >
            Close
          </Button>
        </DialogTitle>
        <Divider />
        <TableFilterView config={config} filter={fields} />
        <TableView
          filter={fields}
          config={config}
          data={list}
          columns={columns()}
          select={{
            selected,
            setSelected,
          }}
        />
        <TablePaginationView rowsPerPageList={[5, 10, 20, 50]} config={config} total={total} />
      </Dialog>
    </>
  );
}
