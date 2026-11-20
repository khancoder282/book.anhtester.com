import { useState, useEffect } from 'react';

import { Box, Typography } from '@mui/material';

import { formatFilePath } from 'src/utils/format-filepath';

import { useTranslate } from 'src/locales';
import { AT_TONES, toneOf } from 'src/theme/at-tones';

import { SvgColor } from 'src/components/svg-color';

// Bìa mặc định: gradient theo tone AT UI, chọn theo tên sách để mỗi sách luôn ra cùng một màu
const pickPalette = (name: string) => {
  const tone = AT_TONES[toneOf(name)];
  return [tone.c1, tone.c2];
};

export type BookCoverProps = {
  /** Đường dẫn ảnh trong thư mục upload (chưa qua formatFilePath) */
  src?: string;
  name: string;
  sx?: Sx;
  /** data-testid cho ảnh bìa (cả ảnh thật lẫn bìa mặc định) */
  testId?: string;
};

/**
 * Ảnh bìa sách. Không có ảnh hoặc ảnh lỗi thì hiện bìa mặc định (màu theo tên + tên sách).
 */
export function BookCover({ src, name, sx, testId }: BookCoverProps) {
  const { t } = useTranslate();
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (src && !failed) {
    return (
      <Box
        component="img"
        data-testid={testId}
        loading="lazy"
        alt={name}
        src={formatFilePath(src)}
        onError={() => setFailed(true)}
        sx={{
          width: 1,
          display: 'block',
          objectFit: 'cover',
          bgcolor: 'background.neutral',
          ...sx,
        }}
      />
    );
  }

  const [from, to] = pickPalette(name);
  return (
    <Box
      role="img"
      data-testid={testId}
      aria-label={t('book.noCover', { name })}
      data-cover="placeholder"
      sx={{
        width: 1,
        p: 2,
        gap: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'common.white',
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        ...sx,
      }}
    >
      <SvgColor
        src="/assets/icons/navbar/ic-book.svg"
        sx={{ width: 36, height: 36, opacity: 0.85 }}
      />
      <Typography
        variant="subtitle1"
        sx={{
          fontFamily: (theme) => theme.typography.fontSecondaryFamily,
          textShadow: '0 1px 2px rgba(0,0,0,.25)',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {name}
      </Typography>
    </Box>
  );
}
