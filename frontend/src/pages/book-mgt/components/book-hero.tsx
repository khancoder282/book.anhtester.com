import { useState, useEffect } from 'react';

import { Box, Stack, Button, InputBase, Typography } from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { searchInputProps } from 'src/components/fields/search-input-props';

import { Book3D } from './book-3d';

// ----------------------------------------------------------------------

type BookHeroProps = {
  total: number;
  categoryCount: number;
  featured: BookView[];
  search: string;
  onSearch: (value: string) => void;
  action?: React.ReactNode;
};

/**
 * Băng rôn đầu trang Book: tên nhà sách, ô tìm nhanh, số liệu và 3 cuốn xem nhiều nhất xếp nghiêng như
 * trên kệ trưng bày. Nền gradient xanh lá logo → teal → xanh dương nhạt theo tone AT UI.
 */
export function BookHero({
  total,
  categoryCount,
  featured,
  search,
  onSearch,
  action,
}: BookHeroProps) {
  const { t } = useTranslate();
  const [value, setValue] = useState(search);

  useEffect(() => setValue(search), [search]);

  return (
    <Box
      data-testid="book-hero"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        mb: 4,
        px: { xs: 3, md: 5 },
        py: { xs: 4, md: 5 },
        color: '#fff',
        background:
          'linear-gradient(120deg, var(--at-green-2) 0%, var(--at-teal-2) 48%, var(--at-sky-2) 100%)',
        boxShadow: '0 18px 40px -18px rgba(13,148,136,.55)',
        // Hoạ tiết gáy sách mờ phía sau
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          opacity: 0.08,
          background:
            'repeating-linear-gradient(90deg, #fff 0 10px, transparent 10px 16px, #fff 16px 22px, transparent 22px 40px)',
          maskImage: 'linear-gradient(90deg, transparent 40%, #000 100%)',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'grid',
          gap: 4,
          alignItems: 'center',
          gridTemplateColumns: { xs: '1fr', md: '1.25fr 1fr' },
        }}
      >
        <Stack spacing={2}>
          <Typography variant="overline" sx={{ opacity: 0.85 }}>
            {t('bookstore.hero.eyebrow')}
          </Typography>
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontFamily: (theme) => theme.typography.fontSecondaryFamily, lineHeight: 1.25 }}
          >
            {t('bookstore.hero.title')}
          </Typography>
          <Typography sx={{ opacity: 0.9, maxWidth: 520 }}>
            {t('bookstore.hero.subtitle', { count: total, categories: categoryCount })}
          </Typography>

          <Box
            component="form"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              onSearch(value.trim());
            }}
            sx={{
              mt: 1,
              p: 0.75,
              pl: 2,
              gap: 1,
              maxWidth: 560,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,.35)',
            }}
          >
            <Iconify
              icon="eva:search-fill"
              width={22}
              sx={{ color: 'text.disabled', flexShrink: 0 }}
            />
            <InputBase
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t('bookstore.hero.search')}
              inputProps={{
                ...searchInputProps,
                'aria-label': t('bookstore.hero.search'),
                'data-testid': 'book-hero-search',
              }}
              sx={{ flex: 1, color: 'text.primary', typography: 'body1' }}
            />
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              data-testid="book-hero-search-submit"
            >
              {t('bookstore.hero.searchButton')}
            </Button>
          </Box>

          <Stack
            direction="row"
            spacing={3}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            sx={{ pt: 1 }}
          >
            <Box>
              <Typography variant="h4" component="span" data-testid="book-hero-total">
                {total}
              </Typography>{' '}
              <Box component="span" sx={{ opacity: 0.85 }}>
                {t('bookstore.hero.books')}
              </Box>
            </Box>
            <Box>
              <Typography variant="h4" component="span">
                {categoryCount}
              </Typography>{' '}
              <Box component="span" sx={{ opacity: 0.85 }}>
                {t('bookstore.hero.categories')}
              </Box>
            </Box>
            {action}
          </Stack>
        </Stack>

        {featured.length > 0 && (
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Typography
              variant="overline"
              sx={{ display: 'block', textAlign: 'center', opacity: 0.85, mb: 2 }}
            >
              {t('bookstore.hero.featured')}
            </Typography>
            <Box sx={{ position: 'relative', height: 300, mx: 'auto', maxWidth: 400 }}>
              {featured.slice(0, 3).map((book, i) => {
                const pos = [
                  { left: '4%', rotate: -10, z: 1, top: 34 },
                  { left: '31%', rotate: 0, z: 3, top: 0 },
                  { left: '58%', rotate: 10, z: 2, top: 34 },
                ][i];
                return (
                  <Box
                    key={book.id}
                    component={RouterLink}
                    href={`/book-management/detail/${book.slug}`}
                    className="book-hover"
                    aria-label={book.name}
                    data-testid={`book-hero-featured-${i}`}
                    sx={{
                      position: 'absolute',
                      width: '38%',
                      left: pos.left,
                      top: pos.top,
                      zIndex: pos.z,
                      transform: `rotate(${pos.rotate}deg)`,
                      transition: 'transform .3s',
                      '&:hover': {
                        transform: `rotate(${pos.rotate}deg) translateY(-8px)`,
                        zIndex: 4,
                      },
                    }}
                  >
                    <Book3D src={book.picture[0]} name={book.name} hoverLift={false} />
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export function NewBookButton({ href }: { href: string }) {
  const { t } = useTranslate();
  return (
    <Button
      variant="contained"
      color="secondary"
      size="large"
      startIcon={<Iconify icon="mingcute:add-line" />}
      LinkComponent={RouterLink}
      href={href}
      sx={{ ml: { md: 'auto' } }}
    >
      {t('book.newBook')}
    </Button>
  );
}
