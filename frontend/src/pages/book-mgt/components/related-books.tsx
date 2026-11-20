import { useCallback } from 'react';

import { Box, Stack, Button, Typography } from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { useRequest } from 'src/hooks/use-request';

import { useAuth } from 'src/store/auth';
import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';

import { getBooks } from '../api/get-books';
import { CardBookView } from './card-book-view';

// ----------------------------------------------------------------------

type RelatedBooksProps = {
  bookId?: string;
  category?: string;
};

/** Kệ sách cùng thể loại (không có thể loại thì lấy sách xem nhiều), cuộn ngang, bỏ chính sách đang xem. */
export function RelatedBooks({ bookId, category }: RelatedBooksProps) {
  const { t } = useTranslate();
  const { auth } = useAuth();

  const { data } = useRequest(
    useCallback(
      () =>
        getBooks({
          search: JSON.stringify({
            ...(bookId && { NOT: { id: bookId } }),
            ...(category && { categories: { some: { name: { in: [category] } } } }),
          }),
          sortBy: 'desc',
          sort: 'viewCount',
          page: 1,
          limit: 10,
        }),
      [bookId, category]
    )
  );
  const list = data?.list ?? [];

  if (!bookId || list.length === 0) return null;

  return (
    <Box component="section" data-testid="related-books" sx={{ mt: 8 }}>
      <Stack direction="row" alignItems="center" sx={{ mb: 2.5 }}>
        <Typography
          variant="h5"
          component="h2"
          sx={{ flex: 1, fontFamily: (theme) => theme.typography.fontSecondaryFamily }}
        >
          {category
            ? t('bookstore.detail.related', { category })
            : t('bookstore.detail.relatedAll')}
        </Typography>
        <Button
          color="primary"
          component={RouterLink}
          href={
            category
              ? `/book-management?category=${encodeURIComponent(category)}`
              : '/book-management'
          }
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
        >
          {t('bookstore.detail.seeAll')}
        </Button>
      </Stack>
      <Stack
        direction="row"
        spacing={2.5}
        sx={{ overflowX: 'auto', pb: 2, px: 0.5, scrollSnapType: 'x mandatory' }}
      >
        {list.map((book) => (
          <Box
            key={book.id}
            sx={{ width: { xs: 200, md: 228 }, flexShrink: 0, scrollSnapAlign: 'start' }}
          >
            <CardBookView book={book} isEdit={!!auth} />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
