import { useMemo, useState, useEffect, useCallback } from 'react';

import { Box, Grid, Button, Typography } from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { useRequest } from 'src/hooks/use-request';
import { useThrottle } from 'src/hooks/use-throttle';
import { useScrollTop } from 'src/hooks/use-scroll-top';

import { useAuth } from 'src/store/auth';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { NoData } from 'src/components/grid-view/components/not-data';
import { ButtonScrollTop } from 'src/components/buttons/button-scroll-top';

import { getBooks } from './api/get-books';
import { useFilterBook } from './stores/filter';
import { FilterBook } from './components/filter-book';
import { CardBookView } from './components/card-book-view';
import { CardBookViewSmoll } from './components/card-book-view-smoll';

export function BookView() {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const config = useFilterBook();
  const { filter, sortObj } = config;
  const [showScrollTop] = useScrollTop();

  const rowsPerPage = 36;

  const callData = useCallback(
    ({ page: pagef }: { page?: number } = {}) =>
      getBooks({
        ...filter,
        sortBy: sortObj.orderBy,
        sort: sortObj.order!,
        page: pagef || 1,
        limit: rowsPerPage,
      }),
    [filter, sortObj]
  );

  const {
    setData,
    data: { list = [], pagination: { totalPage, currentPage } } = {
      list: [],
      pagination: {
        currentPage: 0,
        totalPage: 0,
      },
    },
  } = useRequest(callData);

  const hasMore = useMemo(() => currentPage < Math.min(totalPage, 10), [currentPage, totalPage]);

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
              list: (prev?.list ?? []).concat(e.list),
              pagination: e.pagination,
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

  const renderLinkNew = (() => {
    const path = '/book-management/handle';
    const query = new URLSearchParams();
    query.set('name', 'Create-new-book');
    const queryCurrent = config.searchParams.toString();
    if (queryCurrent) {
      query.set('query', queryCurrent);
    }
    return path + '?' + query.toString();
  })()

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Book Management
        </Typography>
        {auth && (
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
            LinkComponent={RouterLink}
            href={renderLinkNew}
          >
            New book
          </Button>
        )}
      </Box>

      <FilterBook config={config} />

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
      <ButtonScrollTop in={showScrollTop} />
    </DashboardContent>
  );
}
