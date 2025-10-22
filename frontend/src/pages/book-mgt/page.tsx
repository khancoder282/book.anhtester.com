import { useMemo, useState, useEffect, useCallback } from 'react';

import {
  Box,
  Fab,
  Tab,
  Grid,
  Zoom,
  Tabs,
  Stack,
  Button,
  Tooltip,
  Divider,
  Collapse,
  Typography,
  FormHelperText,
} from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { useRequest } from 'src/hooks/use-request';
import { useDebounce } from 'src/hooks/use-debound';
import { useThrottle } from 'src/hooks/use-throttle';
import { useScrollTop } from 'src/hooks/use-scroll-top';

import { useAuth } from 'src/store/auth';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { SearchField } from 'src/components/fields/search-filed';
import { FromToField } from 'src/components/fields/from-to-field';
import { NoData } from 'src/components/grid-view/components/not-data';

import { getBooks } from './api/get-books';
import { Category } from './api/categorys';
import { BookSort } from './components/book-sort';
import { CardBookView } from './components/card-book-view';
import { CardBookViewSmoll } from './components/card-book-view-smoll';

const mappingSort = {
  Feature: {
    orderBy: 'desc',
    order: 'viewCount',
  },
  Newest: {
    orderBy: 'desc',
    order: 'createdAt',
  },
  'Price: Low to High': {
    orderBy: 'asc',
    order: 'currentPrice',
  },
  'Price: High to Low': {
    orderBy: 'desc',
    order: 'currentPrice',
  },
};

const priceOptions = [10_000, 100_000, 1_000_000, 10_000_000];

function formatNumber(from: number | null) {
  if (!from) return 'unset';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(from);
}

function getPriceLabel(price: { from?: number | null; to?: number | null }): string {
  const { from, to } = price;

  if (from != null && to != null)
    return `Price between ${formatNumber(from)} and ${formatNumber(to)}`;

  if (from != null) return `Price greater than or equal to ${formatNumber(from)}`;

  if (to != null) return `Price less than or equal to ${formatNumber(to)}`;

  return 'Price not specified';
}

export function BookView() {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [category, setCategory] = useState('');
  const [showScrollTop] = useScrollTop();
  const [sort, setSort] = useState<keyof typeof mappingSort>('Feature');
  const [isFilter, setIsFilter] = useState(false);
  const [price, setPrice] = useState<{ from: number | null; to: number | null }>({
    from: null,
    to: null,
  });

  const rowsPerPage = 36;
  const { data: categories = [] } = useRequest(() => Category.get());

  const _price = useDebounce(price, 500);

  const filter = useMemo(
    () => ({
      search: JSON.stringify({
        ...(category && {
          categories: {
            some: {
              name: {
                in: [category],
              },
            },
          },
        }),
        ...(searchName && {
          OR: ['name', 'description', 'slug'].map((field) => ({
            [field]: {
              contains: searchName,
            },
          })),
        }),
        ...(_price.from && {
          currentPrice: {
            gte: _price.from,
          },
        }),
        ...(_price.to && {
          currentPrice: {
            lte: _price.to,
          },
        }),
      }),
    }),
    [category, _price.from, _price.to, searchName]
  );
  const callData = useCallback(
    ({ page: pagef }: { page?: number } = {}) =>
      getBooks({
        ...filter,
        sortBy: mappingSort[sort].orderBy,
        sort: mappingSort[sort].order!,
        page: pagef || 1,
        limit: rowsPerPage - ((pagef || 1) === 1 && !auth ? 1 : 0),
      }),
    [auth, filter, sort]
  );

  const {
    loading: loadingData,
    setData,
    data: { list = [], pagination: { totalPage, currentPage, total } } = {
      list: [],
      pagination: {
        currentPage: 0,
        totalPage: 0,
        total: 0,
      },
    },
  } = useRequest(callData);

  const hasMore = currentPage < Math.min(totalPage, 10) && list.length > 0;

  const handleScroll = useThrottle(
    useCallback(async () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      const scrolledPercent = (scrollTop + windowHeight) / documentHeight;

      if (scrolledPercent >= 0.8 && !loading && hasMore) {
        setLoading(true);
        callData({ page: currentPage + 1 })
          .then((e) => {
            setData((prev) => ({
              list: [...(prev?.list ?? []), ...e.list],
              pagination: { ...prev?.pagination, ...e.pagination },
            }));
          })
          .finally(() => setLoading(false));
      }
    }, [callData, currentPage, hasMore, loading, setData]),
    300
  );

  useEffect(() => {
    const onScroll = () => handleScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [handleScroll]);
  return (
    <DashboardContent>
      <Typography mb={5} variant="h4">
        Books
      </Typography>

      <Box
        display="flex"
        justifyContent="end"
        mb={3}
        alignItems="center"
        gap={2}
        flexWrap="wrap-reverse"
      >
        <Button
          color="inherit"
          startIcon={<Iconify icon="ic:round-filter-list" />}
          endIcon={
            <Iconify
              icon={isFilter ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
            />
          }
          onClick={() => setIsFilter(!isFilter)}
        >
          Filter
        </Button>
        <BookSort
          options={Object.keys(mappingSort).map((item) => ({ value: item, label: item }))}
          sortBy={sort}
          onSort={(s) => setSort(s as any)}
        />
      </Box>

      <Collapse in={isFilter}>
        <Box
          ml="auto"
          mb={3}
          gap={2}
          width={1}
          sx={{
            display: 'flex',
            flexDirection: {
              xs: 'column',
              md: 'row-reverse',
            },
          }}
        >
          <Stack flex={1}>
            <SearchField
              color="inherit"
              value={searchName}
              onChange={setSearchName}
              placeholder="Search book..."
              sx={{ maxWidth: 'unset' }}
              helperText={
                loadingData
                  ? `Search with ${searchName}`
                  : searchName && `Search with ${searchName} to ${total} results`
              }
            />
          </Stack>
          <Stack flex={1}>
            <FromToField value={price} onChange={setPrice} options={priceOptions} />
            <FormHelperText sx={{ textAlign: 'right' }}>{getPriceLabel(price)}</FormHelperText>
          </Stack>
        </Box>
      </Collapse>

      <Tabs
        textColor="inherit"
        variant="scrollable"
        indicatorColor="primary"
        value={category}
        onChange={(_, value) => setCategory(value)}
      >
        <Tab value="" label="All" />
        {categories.map((item) => (
          <Tab
            key={item.name}
            value={item.name}
            label={
              <Box display="flex" gap={0.5} alignItems="center">
                {item.name} <Label>{item.bookCount}</Label>
              </Box>
            }
          />
        ))}
      </Tabs>
      <Divider sx={{ mb: 2 }} />

      <Grid
        container
        columns={{
          xs: 1,
          sm: 2,
          md: 4,
        }}
        spacing={2}
      >
        {list.map((item, i) => (
          <Grid size={i == 0 && !auth ? 2 : 1} key={item.id}>
            {i < 3 && !auth ? (
              <CardBookViewSmoll book={item} isFirst={i === 0} />
            ) : (
              <CardBookView book={item} isEdit={!!auth} />
            )}
          </Grid>
        ))}
      </Grid>

      <Box display="flex" justifyContent="center" mt={5}>
        {hasMore ? (
          <Typography variant="subtitle2" color="textPrimary" display="flex" alignItems="center">
            <Iconify
              sx={{ animation: 'spin 1s linear infinite', mr: 1 }}
              icon="mingcute:loading-fill"
            />
            Loading more book...
          </Typography>
        ) : (
          list.length > 300 && (
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="eva:arrow-ios-upward-fill" />}
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                })
              }
            >
              No more than {list.length} items displayed. Please try searching instead.
            </Button>
          )
        )}
      </Box>

      {list.length === 0 && <NoData sx={{ minHeight: 350 }} />}

      <Stack
        spacing={3}
        sx={{
          position: 'fixed',
          bottom: (t) => t.spacing(4),
          right: (t) => t.spacing(3),
          alignItems: 'flex-end',
        }}
      >
        <Zoom in={showScrollTop}>
          <Fab
            size="medium"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              })
            }
            color="secondary"
            sx={{
              position: 'relative',
              '&:hover::after': { opacity: 1, scale: 1 },
              '&::after': {
                content: '"Click to top"',
                position: 'absolute',
                right: 'calc(100% + 0.75rem)',
                transition: 'all 0.2s ease-in-out',
                transformOrigin: 'right center',
                scale: 0,
                opacity: 0,
                textWrap: 'nowrap',
                bgcolor: (t) => t.palette.Tooltip.bg,
                px: 1,
                py: 0.5,
                typography: 'body2',
                borderRadius: 1,
              },
            }}
          >
            <Iconify width={24} icon="eva:arrow-ios-upward-fill" />
          </Fab>
        </Zoom>
        {auth && (
          <Tooltip title="Add a book" arrow>
            <Fab
              LinkComponent={RouterLink}
              href="/book-management/handle?name=Create-a-new-book"
              color="primary"
            >
              <Iconify width={24} icon="mingcute:add-line" />
            </Fab>
          </Tooltip>
        )}
      </Stack>
    </DashboardContent>
  );
}
