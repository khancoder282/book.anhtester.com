import { Fab, Zoom } from '@mui/material';

import { Iconify } from '../iconify';

export function ButtonScrollTop({ in: show }: { in: boolean }) {
  return (
    <Zoom in={show}>
      <Fab
        size="medium"
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          })
        }
        color="secondary"
        sx={{
          position: 'fixed',
          bottom: (t) => t.spacing(4),
          right: (t) => t.spacing(3),
          '&:hover::after': { opacity: 1, scale: 1 },
          '&::after': {
            content: '"Click to top"',
            position: 'absolute',
            right: 'calc(100% + 0.75rem)',
            transition: 'all 0.2s ease-in-out',
            transformOrigin: 'right center',
            scale: 0,
            opacity: 0,
            textWrap: 'nowrap',
            bgcolor: (t) => t.palette.Tooltip.bg,
            px: 1,
            py: 0.5,
            typography: 'body2',
            borderRadius: 1,
          },
        }}
      >
        <Iconify width={24} icon="eva:arrow-ios-upward-fill" />
      </Fab>
    </Zoom>
  );
}
