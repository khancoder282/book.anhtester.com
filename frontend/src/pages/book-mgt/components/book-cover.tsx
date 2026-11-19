import { useState, useEffect } from 'react';

import { Box, Typography } from '@mui/material';

import { formatFilePath } from 'src/utils/format-filepath';

import { SvgColor } from 'src/components/svg-color';

// Cặp màu gradient cho bìa mặc định, chọn theo tên sách để mỗi sách luôn ra cùng một màu
const PALETTES = [
  ['#00A76F', '#007867'],
  ['#8E33FF', '#5119B7'],
  ['#00B8D9', '#006C9C'],
  ['#FFAB00', '#B76E00'],
  ['#FF5630', '#B71D18'],
  ['#1877F2', '#0C44AE'],
];

const pickPalette = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % 997;
  return PALETTES[hash % PALETTES.length];
};

export type BookCoverProps = {
  /** Đường dẫn ảnh trong thư mục upload (chưa qua formatFilePath) */
  src?: string;
  name: string;
  sx?: Sx;
};

/**
 * Ảnh bìa sách. Không có ảnh hoặc ảnh lỗi thì hiện bìa mặc định (màu theo tên + tên sách).
 */
export function BookCover({ src, name, sx }: BookCoverProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (src && !failed) {
    return (
      <Box
        component="img"
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
      aria-label={`${name} (no cover image)`}
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
