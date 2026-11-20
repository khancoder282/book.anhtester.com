import { useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Grid, Stack, Typography, Pagination } from '@mui/material';

import { useRequest } from 'src/hooks/use-request';
import { useScrollTop } from 'src/hooks/use-scroll-top';

import { useAuth } from 'src/store/auth';
import { useTranslate } from 'src/locales';
import { DashboardContent } from 'src/layouts/dashboard';

import { NoData } from 'src/components/grid-view/components/not-data';
import { ButtonScrollTop } from 'src/components/buttons/button-scroll-top';

import { getBooks } from './api/get-books';
import { Category } from './api/categorys';
import { useFilterBook } from './stores/filter';
import { FilterBook } from './components/filter-book';
import { CardBookView } from './components/card-book-view';
import { BookHero, NewBookButton } from './components/book-hero';

/** Số sách mỗi trang (user chốt 2026-11-21: 20 cuốn, phần còn lại chuyển trang bằng thanh phân trang) */
export const BOOKS_PER_PAGE = 20;

export function BookView() {
  const { t } = useTranslate();
  const { auth } = useAuth();
  const config = useFilterBook();
  const { filter, sortObj, searchParams } = config;
  const [, setSearchParams] = useSearchParams();
  const [showScrollTop] = useScrollTop();
  const resultsRef = useRef<HTMLDivElement>(null);

  // Trang hiện tại nằm trên URL (?page=), đổi bộ lọc / sắp xếp thì về trang 1 (stores/filter.ts)
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    if (p <= 1) next.delete('page');
    else next.set('page', String(p));
    setSearchParams(next);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const {
    loading,
    data: { list = [], pagination: { totalPage, total } } = {
      list: [],
      pagination: { totalPage: 0, total: 0 },
    },
  } = useRequest(
    useCallback(
      () =>
        getBooks({
          ...filter,
          sortBy: sortObj.orderBy,
          sort: sortObj.order!,
          page,
          limit: BOOKS_PER_PAGE,
        }),
      [filter, sortObj, page]
    )
  );
  const from = total === 0 ? 0 : (page - 1) * BOOKS_PER_PAGE + 1;
  const to = Math.min(page * BOOKS_PER_PAGE, total);

  // Băng rôn: 3 sách xem nhiều nhất + tổng số sách / thể loại (không phụ thuộc bộ lọc)
  const { data: featured } = useRequest(
    useCallback(
      () =>
        getBooks({
          // Khách chỉ thấy sách đang bán (giống danh sách bên dưới, xem stores/filter.ts)
          search: auth ? '' : JSON.stringify({ status: 'AVAILABLE' }),
          sortBy: 'desc',
          sort: 'viewCount',
          page: 1,
          limit: 3,
        }),
      [auth]
    )
  );
  const { data: categories = [] } = useRequest(useCallback(() => Category.get(), []));
  const categoryCount = categories.filter((c) => c.isActive && c.bookCount > 0).length;

  const renderLinkNew = (() => {
    const path = '/book-management/handle';
    const query = new URLSearchParams();
    query.set('name', 'Create-new-book');
    const queryCurrent = config.searchParams.toString();
    if (queryCurrent) {
      query.set('query', queryCurrent);
    }
    return path + '?' + query.toString();
  })();

  return (
    <DashboardContent maxWidth="xl">
      <BookHero
        total={featured?.pagination.total ?? 0}
        categoryCount={categoryCount}
        featured={featured?.list ?? []}
        search={config.searchName}
        onSearch={config.setSearchName}
        action={auth && <NewBookButton href={renderLinkNew} />}
      />

      <FilterBook config={config} />

      <Typography
        ref={resultsRef}
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2, scrollMarginTop: 96 }}
        data-testid="book-results"
      >
        {t('bookstore.results', { from, to, total })}
        {config.searchName && ` ${t('bookstore.resultsFor', { keyword: config.searchName })}`}
      </Typography>

      <Grid
        container
        columns={{ xs: 2, sm: 3, md: 4 }}
        spacing={{ xs: 1.5, sm: 2.5 }}
        sx={{ opacity: loading ? 0.55 : 1, transition: 'opacity .2s' }}
      >
        {list.map((item) => (
          <Grid size={1} key={item.id}>
            <CardBookView book={item} isEdit={!!auth} />
          </Grid>
        ))}
      </Grid>

      {totalPage > 1 && (
        <Stack alignItems="center" sx={{ mt: 5 }}>
          <Pagination
            page={Math.min(page, totalPage)}
            count={totalPage}
            onChange={(_, p) => setPage(p)}
            color="primary"
            shape="rounded"
            size="large"
            showFirstButton
            showLastButton
            data-testid="book-pagination"
            sx={{
              '& .MuiPaginationItem-root': { fontWeight: 600 },
              '& .MuiPaginationItem-root.Mui-selected': {
                color: '#fff',
                backgroundImage: 'var(--at-grad-green)',
                boxShadow: 'var(--at-glow-green)',
              },
            }}
          />
        </Stack>
      )}

      {list.length === 0 && <NoData sx={{ minHeight: 350 }} />}
      <ButtonScrollTop in={showScrollTop} />
    </DashboardContent>
  );
}
