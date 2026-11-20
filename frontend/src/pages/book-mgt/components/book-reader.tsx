import { useState, useEffect } from 'react';

import { useTheme } from '@mui/material/styles';
import {
  Box,
  Stack,
  Button,
  Dialog,
  Tooltip,
  IconButton,
  Typography,
  useMediaQuery,
  LinearProgress,
} from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type ReaderTheme = 'light' | 'paper' | 'dark';

const READER_KEY = 'book-anhtester:reader';
const SIZES = [15, 16, 17, 18, 20, 22, 24];
const READER_THEMES: Record<ReaderTheme, { bg: string; ink: string; muted: string }> = {
  light: { bg: '#FFFFFF', ink: '#1E293B', muted: '#64748B' },
  paper: { bg: '#F7F0E1', ink: '#3B2F22', muted: '#8A7660' },
  dark: { bg: '#141821', ink: '#D7DCE5', muted: '#8B95A7' },
};

function loadPrefs(): { size: number; theme: ReaderTheme } {
  try {
    const raw = JSON.parse(localStorage.getItem(READER_KEY) || '{}');
    return {
      size: SIZES.includes(raw.size) ? raw.size : 18,
      theme: raw.theme in READER_THEMES ? raw.theme : 'paper',
    };
  } catch {
    return { size: 18, theme: 'paper' };
  }
}

/** Tách nội dung đọc thử: đoạn cách nhau bằng dòng trống, dòng "## " là tiêu đề nhỏ. */
export function parsePreview(content: string) {
  return content
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) =>
      block.startsWith('## ')
        ? { type: 'heading' as const, text: block.slice(3).trim() }
        : { type: 'paragraph' as const, text: block.replace(/\n/g, ' ') }
    );
}

type BookReaderProps = {
  open: boolean;
  onClose: () => void;
  bookName: string;
  author?: string | null;
  title?: string | null;
  content: string;
  /** Nút cuối bài (VD thêm vào giỏ) */
  endAction?: React.ReactNode;
};

export function BookReader({
  open,
  onClose,
  bookName,
  author,
  title,
  content,
  endAction,
}: BookReaderProps) {
  const { t } = useTranslate();
  const muiTheme = useTheme();
  const fullScreen = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [prefs, setPrefs] = useState(loadPrefs);
  const [progress, setProgress] = useState(0);
  const colors = READER_THEMES[prefs.theme];
  const blocks = parsePreview(content);

  useEffect(() => {
    try {
      localStorage.setItem(READER_KEY, JSON.stringify(prefs));
    } catch {
      // trình duyệt chặn lưu thì chỉ không nhớ lựa chọn
    }
  }, [prefs]);

  useEffect(() => {
    if (open) setProgress(0);
  }, [open]);

  const sizeIdx = SIZES.indexOf(prefs.size);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="md"
      data-testid="book-reader"
      aria-labelledby="book-reader-title"
      slotProps={{
        paper: {
          sx: {
            bgcolor: colors.bg,
            color: colors.ink,
            height: fullScreen ? 1 : '90vh',
            backgroundImage: 'none',
          },
        },
      }}
    >
      {/* Thanh công cụ */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ px: 2, py: 1, borderBottom: `1px solid ${colors.muted}33` }}
      >
        <Iconify icon="solar:book-2-bold-duotone" width={24} sx={{ color: 'primary.light' }} />
        <Typography variant="subtitle2" noWrap sx={{ flex: 1, minWidth: 0, color: colors.ink }}>
          {t('bookstore.reader.title')} · {bookName}
        </Typography>

        <Tooltip title={t('bookstore.reader.smaller')}>
          <span>
            <IconButton
              size="small"
              aria-label={t('bookstore.reader.smaller')}
              data-testid="reader-font-smaller"
              disabled={sizeIdx <= 0}
              onClick={() => setPrefs((p) => ({ ...p, size: SIZES[sizeIdx - 1] }))}
              sx={{ color: colors.ink, fontWeight: 700, fontSize: 14, width: 34 }}
            >
              A-
            </IconButton>
          </span>
        </Tooltip>
        <Typography
          variant="caption"
          data-testid="reader-font-size"
          sx={{ color: colors.muted, minWidth: 28, textAlign: 'center' }}
        >
          {prefs.size}
        </Typography>
        <Tooltip title={t('bookstore.reader.larger')}>
          <span>
            <IconButton
              size="small"
              aria-label={t('bookstore.reader.larger')}
              data-testid="reader-font-larger"
              disabled={sizeIdx >= SIZES.length - 1}
              onClick={() => setPrefs((p) => ({ ...p, size: SIZES[sizeIdx + 1] }))}
              sx={{ color: colors.ink, fontWeight: 700, fontSize: 18, width: 34 }}
            >
              A+
            </IconButton>
          </span>
        </Tooltip>

        <Stack
          direction="row"
          spacing={0.5}
          role="radiogroup"
          aria-label={t('bookstore.reader.theme')}
          sx={{ pl: 1 }}
        >
          {(Object.keys(READER_THEMES) as ReaderTheme[]).map((key) => (
            <Tooltip key={key} title={t(`bookstore.reader.${key}`)}>
              <Box
                component="button"
                type="button"
                role="radio"
                aria-checked={prefs.theme === key}
                aria-label={t(`bookstore.reader.${key}`)}
                data-testid={`reader-theme-${key}`}
                onClick={() => setPrefs((p) => ({ ...p, theme: key }))}
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  bgcolor: READER_THEMES[key].bg,
                  border: '2px solid',
                  borderColor: prefs.theme === key ? 'primary.light' : `${colors.muted}66`,
                  boxShadow: prefs.theme === key ? 'var(--at-glow-green)' : 'none',
                }}
              />
            </Tooltip>
          ))}
        </Stack>

        <Tooltip title={t('bookstore.reader.close')}>
          <IconButton
            aria-label={t('bookstore.reader.close')}
            data-testid="reader-close"
            onClick={onClose}
            sx={{ color: colors.ink }}
          >
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Tooltip>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={progress}
        aria-label={t('bookstore.reader.progress', { percent: Math.round(progress) })}
        sx={{
          height: 3,
          bgcolor: 'transparent',
          '& .MuiLinearProgress-bar': { backgroundImage: 'var(--at-grad-green)' },
        }}
      />

      {/* Nội dung */}
      <Box
        data-testid="reader-content"
        onScroll={(e) => {
          const el = e.currentTarget;
          const max = el.scrollHeight - el.clientHeight;
          setProgress(max > 0 ? (el.scrollTop / max) * 100 : 100);
        }}
        sx={{ flex: 1, overflowY: 'auto', px: { xs: 3, sm: 6, md: 10 }, py: { xs: 4, md: 6 } }}
      >
        <Box
          sx={{
            maxWidth: 680,
            mx: 'auto',
            fontFamily: "'Merriweather Variable', Georgia, 'Times New Roman', serif",
            fontSize: prefs.size,
            lineHeight: 1.85,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: colors.muted,
              letterSpacing: '.2em',
            }}
          >
            {bookName}
            {author ? ` · ${author}` : ''}
          </Typography>
          <Typography
            id="book-reader-title"
            component="h2"
            data-testid="reader-title"
            sx={{
              mt: 1,
              mb: 4,
              textAlign: 'center',
              fontFamily: 'inherit',
              fontWeight: 800,
              fontSize: '1.45em',
              lineHeight: 1.35,
              color: colors.ink,
            }}
          >
            {title || t('bookstore.reader.title')}
          </Typography>
          <Box
            aria-hidden
            sx={{
              mx: 'auto',
              mb: 4,
              width: 64,
              height: 3,
              borderRadius: 2,
              backgroundImage: 'var(--at-grad-orange)',
            }}
          />

          {blocks.map((b, i) =>
            b.type === 'heading' ? (
              <Typography
                key={i}
                component="h3"
                sx={{
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  fontSize: '1.12em',
                  mt: 4,
                  mb: 1.5,
                  color: colors.ink,
                }}
              >
                {b.text}
              </Typography>
            ) : (
              <Box
                key={i}
                component="p"
                sx={{
                  m: 0,
                  mb: '1.1em',
                  textAlign: 'justify',
                  hyphens: 'auto',
                  textIndent: i === 0 ? 0 : '1.6em',
                  // Chữ cái đầu chương to (drop cap)
                  ...(i === 0 && {
                    '&::first-letter': {
                      float: 'left',
                      fontSize: '3.2em',
                      lineHeight: 0.9,
                      fontWeight: 800,
                      pr: '0.12em',
                      pt: '0.08em',
                      color: 'var(--at-green-2)',
                    },
                  }),
                }}
              >
                {b.text}
              </Box>
            )
          )}

          <Stack
            alignItems="center"
            spacing={1.5}
            sx={{ mt: 6, mb: 2, fontFamily: 'Inter Variable, sans-serif' }}
            data-testid="reader-end"
          >
            <Typography sx={{ color: colors.muted, letterSpacing: '.4em' }}>❦ ❦ ❦</Typography>
            <Typography variant="h6" sx={{ color: colors.ink }}>
              {t('bookstore.reader.endTitle')}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.muted, textAlign: 'center' }}>
              {t('bookstore.reader.endText')}
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
              {endAction}
              <Button variant="outlined" color="inherit" onClick={onClose}>
                {t('bookstore.reader.close')}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Dialog>
  );
}
