import { Fab, Zoom } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from '../iconify';

export function ButtonScrollTop({ in: show }: { in: boolean }) {
  const { t } = useTranslate();

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
          bottom: (theme) => theme.spacing(4),
          right: (theme) => theme.spacing(3),
          '&:hover::after': { opacity: 1, scale: 1 },
          '&::after': {
            content: `"${t('components.button.scrollTop')}"`,
            position: 'absolute',
            right: 'calc(100% + 0.75rem)',
            transition: 'all 0.2s ease-in-out',
            transformOrigin: 'right center',
            scale: 0,
            opacity: 0,
            textWrap: 'nowrap',
            bgcolor: (theme) => theme.palette.Tooltip.bg,
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
