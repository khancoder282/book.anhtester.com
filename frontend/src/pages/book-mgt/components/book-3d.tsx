import Box from '@mui/material/Box';

import { BookCover } from './book-cover';

// ----------------------------------------------------------------------

export type Book3DProps = {
  src?: string;
  name: string;
  /** Nghiêng nhẹ + nổi lên khi rê chuột vào phần tử cha có class `book-hover` */
  hoverLift?: boolean;
  sx?: Sx;
};

/**
 * Bìa sách dạng cuốn sách thật: tỉ lệ 2:3, gáy sách tối bên trái, vệt sáng trên bìa,
 * mép giấy bên phải và bóng đổ. Nội dung ảnh vẫn là `BookCover` (có bìa mặc định khi không có ảnh).
 */
export function Book3D({ src, name, hoverLift = true, sx }: Book3DProps) {
  return (
    <Box
      sx={{
        perspective: '900px',
        ...sx,
      }}
    >
      <Box
        className="book-3d"
        sx={{
          position: 'relative',
          aspectRatio: '2 / 3',
          borderRadius: '3px 8px 8px 3px',
          transformOrigin: 'left center',
          transition: 'transform .35s cubic-bezier(.2,.7,.3,1), box-shadow .35s',
          boxShadow:
            '0 1px 1px rgba(15,23,42,.08), 4px 6px 10px -2px rgba(15,23,42,.22), 12px 18px 28px -10px rgba(15,23,42,.35)',
          ...(hoverLift && {
            '.book-hover:hover &, .book-hover:focus-within &': {
              transform: 'rotateY(-14deg) translateY(-6px)',
              boxShadow:
                '0 1px 1px rgba(15,23,42,.08), 10px 10px 16px -4px rgba(15,23,42,.25), 22px 26px 36px -12px rgba(15,23,42,.4)',
            },
          }),
          // Mép giấy bên phải
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 4,
            bottom: 4,
            right: -5,
            width: 6,
            borderRadius: '0 3px 3px 0',
            background:
              'repeating-linear-gradient(90deg, #fdfbf6 0px, #fdfbf6 1px, #e9e4d8 1.5px, #fdfbf6 2px)',
            boxShadow: '1px 1px 3px rgba(15,23,42,.18)',
            zIndex: -1,
          },
        }}
      >
        <BookCover
          src={src}
          name={name}
          sx={{
            position: 'absolute',
            inset: 0,
            height: 1,
            borderRadius: 'inherit',
            aspectRatio: 'auto',
          }}
        />
        {/* Gáy sách + vệt sáng */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            background:
              'linear-gradient(90deg, rgba(0,0,0,.32) 0%, rgba(0,0,0,.12) 3.5%, rgba(255,255,255,.22) 5%, rgba(255,255,255,0) 9%), linear-gradient(115deg, rgba(255,255,255,.18) 0%, rgba(255,255,255,0) 38%)',
          }}
        />
      </Box>
    </Box>
  );
}
