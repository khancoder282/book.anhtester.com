import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type ImageLightboxProps = {
  open: boolean;
  onClose: () => void;
  /** URL ảnh đã sẵn sàng hiển thị (đã qua formatFilePath) */
  images: string[];
  index: number;
  onIndexChange: (index: number) => void;
  /** Dùng làm alt + tiêu đề trên thanh công cụ */
  title?: string;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const STEP = 0.5;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

/**
 * Xem ảnh toàn màn hình: phóng to/thu nhỏ (nút, con lăn chuột, nhấp đúp), kéo để di chuyển khi đang
 * phóng to, xoay 90°, chuyển ảnh bằng nút / phím ← →, Esc để đóng, 0 để về mặc định.
 */
export function ImageLightbox({
  open,
  onClose,
  images,
  index,
  onIndexChange,
  title,
}: ImageLightboxProps) {
  const { t } = useTranslate();
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const total = images.length;

  const reset = useCallback(() => {
    setZoom(1);
    setRotate(0);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => reset(), [index, open, reset]);

  const go = useCallback(
    (delta: number) => {
      if (total < 2) return;
      onIndexChange((index + delta + total) % total);
    },
    [index, onIndexChange, total]
  );

  const zoomBy = useCallback((delta: number) => {
    setZoom((z) => {
      const next = clamp(Math.round((z + delta) * 100) / 100, MIN_ZOOM, MAX_ZOOM);
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === '+' || e.key === '=') zoomBy(STEP);
      else if (e.key === '-') zoomBy(-STEP);
      else if (e.key === '0') reset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, go, zoomBy, reset]);

  const tool = (
    label: string,
    icon: Parameters<typeof Iconify>[0]['icon'],
    onClick: () => void,
    testId: string,
    disabled = false
  ) => (
    <Tooltip title={label}>
      <span>
        <IconButton
          aria-label={label}
          data-testid={testId}
          disabled={disabled}
          onClick={onClick}
          sx={{ color: 'common.white', '&.Mui-disabled': { color: 'rgba(255,255,255,.3)' } }}
        >
          <Iconify icon={icon} width={22} />
        </IconButton>
      </span>
    </Tooltip>
  );

  const src = images[index];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      data-testid="image-lightbox"
      aria-label={title}
      slotProps={{
        paper: {
          sx: {
            bgcolor: 'rgba(8, 12, 20, .96)',
            boxShadow: 'none',
            // Màn tràn viền: chừa thanh trạng thái / điều hướng để thanh công cụ không bị đè (W25)
            pt: 'env(safe-area-inset-top, 0px)',
            pb: 'env(safe-area-inset-bottom, 0px)',
          },
        },
      }}
    >
      {/* Thanh công cụ */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{
          px: 2,
          py: 1,
          color: 'common.white',
          borderBottom: '1px solid rgba(255,255,255,.08)',
        }}
      >
        <Typography variant="subtitle1" noWrap sx={{ flexGrow: 1, minWidth: 0 }}>
          {title}
          {total > 0 && (
            <Box
              component="span"
              data-testid="lightbox-counter"
              sx={{ ml: 1.5, opacity: 0.6, fontWeight: 400 }}
            >
              {index + 1} / {total}
            </Box>
          )}
        </Typography>
        <Typography
          variant="body2"
          data-testid="lightbox-zoom"
          sx={{ minWidth: 52, textAlign: 'center', opacity: 0.8 }}
        >
          {Math.round(zoom * 100)}%
        </Typography>
        {tool(
          t('components.lightbox.zoomOut'),
          'solar:magnifier-zoom-out-bold',
          () => zoomBy(-STEP),
          'lightbox-zoom-out',
          zoom <= MIN_ZOOM
        )}
        {tool(
          t('components.lightbox.zoomIn'),
          'solar:magnifier-zoom-in-bold',
          () => zoomBy(STEP),
          'lightbox-zoom-in',
          zoom >= MAX_ZOOM
        )}
        {tool(
          t('components.lightbox.rotate'),
          'solar:refresh-bold',
          () => setRotate((r) => (r + 90) % 360),
          'lightbox-rotate'
        )}
        {tool(t('components.lightbox.reset'), 'solar:restart-bold', reset, 'lightbox-reset')}
        {src && (
          <Tooltip title={t('components.lightbox.openOriginal')}>
            <IconButton
              component="a"
              href={src}
              target="_blank"
              rel="noopener"
              aria-label={t('components.lightbox.openOriginal')}
              sx={{ color: 'common.white' }}
            >
              <Iconify icon="solar:link-circle-line-duotone" width={22} />
            </IconButton>
          </Tooltip>
        )}
        {tool(t('components.lightbox.close'), 'mingcute:close-line', onClose, 'lightbox-close')}
      </Stack>

      {/* Vùng ảnh */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          overflow: 'hidden',
          userSelect: 'none',
          touchAction: 'none',
          cursor: zoom > 1 ? (drag.current ? 'grabbing' : 'grab') : 'zoom-in',
        }}
        onWheel={(e) => zoomBy(e.deltaY < 0 ? STEP / 2 : -STEP / 2)}
        onDoubleClick={() => (zoom > 1 ? reset() : setZoom(2.5))}
        onPointerDown={(e) => {
          if (zoom <= 1) return;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          setOffset({
            x: drag.current.ox + (e.clientX - drag.current.x),
            y: drag.current.oy + (e.clientY - drag.current.y),
          });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
      >
        {src && (
          <Box
            component="img"
            src={src}
            alt={title}
            draggable={false}
            data-testid="lightbox-image"
            sx={{
              position: 'absolute',
              inset: 0,
              m: 'auto',
              maxWidth: '92%',
              maxHeight: '92%',
              objectFit: 'contain',
              borderRadius: 1,
              boxShadow: '0 20px 60px rgba(0,0,0,.5)',
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotate}deg)`,
              transition: drag.current ? 'none' : 'transform .18s ease',
            }}
          />
        )}

        {total > 1 && (
          <>
            <IconButton
              aria-label={t('components.lightbox.prev')}
              data-testid="lightbox-prev"
              onClick={() => go(-1)}
              sx={{ ...navBtn, left: 16 }}
            >
              <Iconify icon="eva:arrow-ios-back-fill" width={28} />
            </IconButton>
            <IconButton
              aria-label={t('components.lightbox.next')}
              data-testid="lightbox-next"
              onClick={() => go(1)}
              sx={{ ...navBtn, right: 16 }}
            >
              <Iconify icon="eva:arrow-ios-forward-fill" width={28} />
            </IconButton>
          </>
        )}
      </Box>

      {/* Dải ảnh nhỏ */}
      {total > 1 && (
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          sx={{ p: 1.5, overflowX: 'auto' }}
        >
          {images.map((img, i) => (
            <Box
              key={img}
              component="button"
              type="button"
              aria-label={`${t('components.lightbox.image')} ${i + 1}`}
              aria-current={i === index}
              data-testid={`lightbox-thumb-${i}`}
              onClick={() => onIndexChange(i)}
              sx={{
                p: 0,
                width: 56,
                height: 76,
                flexShrink: 0,
                borderRadius: 1,
                overflow: 'hidden',
                border: '2px solid',
                borderColor: i === index ? 'primary.light' : 'transparent',
                opacity: i === index ? 1 : 0.55,
                bgcolor: 'transparent',
                transition: 'opacity .15s, border-color .15s',
                '&:hover': { opacity: 1 },
              }}
            >
              <Box
                component="img"
                src={img}
                alt=""
                sx={{ width: 1, height: 1, objectFit: 'cover' }}
              />
            </Box>
          ))}
        </Stack>
      )}

      <Typography
        variant="caption"
        sx={{
          color: 'rgba(255,255,255,.45)',
          textAlign: 'center',
          pb: 1,
          display: { xs: 'none', md: 'block' },
        }}
      >
        {t('components.lightbox.hint')}
      </Typography>
    </Dialog>
  );
}

const navBtn = {
  top: '50%',
  position: 'absolute',
  transform: 'translateY(-50%)',
  color: 'common.white',
  bgcolor: 'rgba(255,255,255,.08)',
  backdropFilter: 'blur(6px)',
  '&:hover': { bgcolor: 'rgba(255,255,255,.18)' },
} as const;
