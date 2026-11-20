import { useState, useEffect } from 'react';

import { keyframes } from '@mui/material/styles';
import { Box, Stack, Button, Typography } from '@mui/material';

import { formatFilePath } from 'src/utils/format-filepath';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { ImageLightbox } from 'src/components/lightbox/image-lightbox';

import { Book3D } from './book-3d';

// ----------------------------------------------------------------------

/** Rê chuột bao lâu thì lật trang, và thời gian một lần lật */
const FLIP_DELAY_MS = 1000;
const FLIP_MS = 750;

const pageTurn = keyframes`
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(-178deg); }
`;
const pageShade = keyframes`
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

const pageSx = {
  display: 'block',
  objectFit: 'cover',
  borderRadius: '3px 8px 8px 3px',
  bgcolor: '#fff',
  boxShadow: '4px 8px 14px -4px rgba(15,23,42,.25), 16px 24px 36px -14px rgba(15,23,42,.35)',
} as const;

type BookGalleryProps = {
  name: string;
  /** Đường dẫn ảnh trong thư mục upload (chưa qua formatFilePath) */
  pictures: string[];
};

/**
 * Ảnh sách trên trang chi tiết: ảnh lớn (rê chuột 1 giây = lật sang trang kế, kiểu lật sách), dải ảnh nhỏ,
 * bấm ảnh / nút "Xem toàn màn hình" mở ImageLightbox (zoom, kéo, xoay, phím mũi tên).
 */
export function BookGallery({ name, pictures }: BookGalleryProps) {
  const { t } = useTranslate();
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const urls = pictures.map((p) => formatFilePath(p));
  const current = urls[index];
  const nextIndex = urls.length ? (index + 1) % urls.length : 0;

  // Rê chuột vào ảnh lớn: chờ 1 giây rồi lật sang trang kế; giữ chuột thì cứ thế lật tiếp
  useEffect(() => {
    if (!hovering || flipping || urls.length < 2) return undefined;
    const timer = setTimeout(() => setFlipping(true), FLIP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [hovering, flipping, index, urls.length]);

  if (pictures.length === 0) {
    return (
      <Box sx={{ p: { xs: 4, md: 6 }, borderRadius: 3, bgcolor: 'var(--at-sunken)' }}>
        <Book3D name={name} hoverLift={false} sx={{ maxWidth: 300, mx: 'auto' }} />
      </Box>
    );
  }

  return (
    <Stack spacing={2} data-testid="book-gallery">
      <Box
        role="button"
        tabIndex={0}
        aria-label={t('bookstore.detail.viewFull')}
        data-testid="book-gallery-main"
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          aspectRatio: '4 / 5',
          bgcolor: 'var(--at-sunken)',
          border: '1px solid var(--at-line)',
          cursor: 'zoom-in',
          outline: 'none',
          '&:focus-visible': {
            boxShadow: (theme) => `0 0 0 3px ${theme.vars.palette.primary.lighter}`,
          },
        }}
      >
        {/* Khung trang sách: lớp dưới là trang kế tiếp, lớp trên là trang hiện tại lật sang trái */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            m: 'auto',
            height: '88%',
            aspectRatio: '2 / 3',
            maxWidth: '88%',
            perspective: '1800px',
          }}
        >
          <Box
            component="img"
            src={flipping ? urls[nextIndex] : current}
            alt={`${name} — ${t('bookstore.detail.imageOf', { index: index + 1, total: urls.length })}`}
            data-testid="book-gallery-image"
            sx={{ ...pageSx, position: 'absolute', inset: 0 }}
          />
          {flipping && (
            <Box
              aria-hidden
              data-testid="book-gallery-flip"
              onAnimationEnd={() => {
                setIndex(nextIndex);
                setFlipping(false);
              }}
              sx={{
                position: 'absolute',
                inset: 0,
                transformOrigin: 'left center',
                transformStyle: 'preserve-3d',
                animation: `${pageTurn} ${FLIP_MS}ms cubic-bezier(.45,.05,.35,1) forwards`,
                // Bóng tối dần trên trang đang lật cho có chiều sâu
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '3px 8px 8px 3px',
                  pointerEvents: 'none',
                  background: 'linear-gradient(90deg, rgba(0,0,0,0) 40%, rgba(0,0,0,.35) 100%)',
                  animation: `${pageShade} ${FLIP_MS}ms ease forwards`,
                },
              }}
            >
              <Box
                component="img"
                src={current}
                alt=""
                sx={{ ...pageSx, width: 1, height: 1, backfaceVisibility: 'hidden' }}
              />
            </Box>
          )}
        </Box>
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          sx={{
            position: 'absolute',
            right: 12,
            bottom: 12,
            px: 1.25,
            py: 0.5,
            borderRadius: 999,
            color: '#fff',
            typography: 'caption',
            bgcolor: 'rgba(15,23,42,.6)',
            backdropFilter: 'blur(6px)',
            pointerEvents: 'none',
          }}
        >
          <Iconify icon="solar:magnifier-zoom-in-bold" width={16} />
          <span>
            {index + 1} / {urls.length}
          </span>
        </Stack>
      </Box>

      {urls.length > 1 && (
        // Dải ảnh nhỏ cuộn ngang: `overflow` xén quầng sáng của ảnh đang chọn thành khối chữ nhật (W24).
        // Chừa đệm cho quầng sáng rồi kéo lề âm để vẫn thẳng hàng với ảnh lớn; ẩn thanh cuộn.
        <Stack
          direction="row"
          spacing={1.25}
          sx={{
            overflowX: 'auto',
            px: 1.5,
            pt: 0.75,
            pb: 2,
            mx: -1.5,
            mb: -1.25,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {urls.map((url, i) => (
            <Box
              key={url}
              component="button"
              type="button"
              data-testid={`book-gallery-thumb-${i}`}
              aria-label={t('bookstore.detail.imageOf', { index: i + 1, total: urls.length })}
              aria-current={i === index}
              onClick={() => {
                setFlipping(false);
                setIndex(i);
              }}
              sx={{
                p: 0.5,
                width: 72,
                height: 96,
                flexShrink: 0,
                borderRadius: 1.5,
                overflow: 'hidden',
                bgcolor: 'var(--at-sunken)',
                border: '2px solid',
                borderColor: i === index ? 'primary.light' : 'var(--at-line)',
                boxShadow: i === index ? 'var(--at-glow-green)' : 'none',
                transition: 'border-color .15s, box-shadow .15s',
              }}
            >
              <Box
                component="img"
                src={url}
                alt=""
                loading="lazy"
                sx={{ width: 1, height: 1, objectFit: 'contain', borderRadius: 0.5 }}
              />
            </Box>
          ))}
        </Stack>
      )}

      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          {t('bookstore.detail.zoomHint')}
        </Typography>
        <Button
          size="small"
          color="info"
          variant="outlined"
          onClick={() => setOpen(true)}
          data-testid="book-gallery-fullscreen"
          startIcon={<Iconify icon="solar:magnifier-zoom-in-bold" />}
        >
          {t('bookstore.detail.viewFull')}
        </Button>
      </Stack>

      <ImageLightbox
        open={open}
        onClose={() => setOpen(false)}
        images={urls}
        index={index}
        onIndexChange={setIndex}
        title={name}
      />
    </Stack>
  );
}
