import type { AtTone } from 'src/theme/at-tones';
import type { IconifyName } from 'src/components/iconify';

import { Box, Stack, Typography } from '@mui/material';

import { atGrad, atGlow } from 'src/theme/at-tones';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type PageHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon: IconifyName;
  /** Màu ô icon theo tone AT UI (mỗi màn một tone để dễ nhận ra) */
  tone?: AtTone;
  /** Nút hành động bên phải (nút chính dùng color="secondary" = cam) */
  action?: React.ReactNode;
  /** Breadcrumbs hoặc nội dung phụ dưới tiêu đề */
  children?: React.ReactNode;
};

/** Tiêu đề trang theo AT UI kit: ô icon gradient + tiêu đề + mô tả ngắn + hành động. */
export function PageHeader({
  title,
  subtitle,
  icon,
  tone = 'green',
  action,
  children,
}: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      alignItems={{ sm: 'center' }}
      sx={{ mb: 4 }}
      data-testid="page-header"
    >
      <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
        <Box
          aria-hidden
          sx={{
            width: 52,
            height: 52,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '14px',
            color: '#fff',
            backgroundImage: atGrad(tone),
            boxShadow: `${atGlow(tone)}, var(--at-gloss)`,
          }}
        >
          <Iconify icon={icon} width={28} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" component="h1" sx={{ lineHeight: 1.3 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography color="text.secondary" sx={{ mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
          {children}
        </Box>
      </Stack>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Stack>
  );
}
