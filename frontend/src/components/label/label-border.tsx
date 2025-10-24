import { Box } from '@mui/material';

export function LabelBorder({
  children,
  error,
  sx,
}: React.PropsWithChildren & { sx?: Sx; error?: boolean }) {
  return (
    <Box
      component="span"
      sx={{
        top: 0,
        left: 0,
        zIndex: 1,
        position: 'absolute',
        display: 'inline-flex',
        ml: (t) => `${t.spacing(2.5)} !important`,
        py: 0.25,
        px: 1,
        color: 'text.primary',
        borderRadius: 2,
        bgcolor: 'background.paper',
        transform: 'translateY(-50%)',
        fontSize: '0.75rem',
        fontWeight: 600,
        border: 'solid 1px',
        borderColor: 'divider',
        ...(error && {
          color: 'error.main',
          borderColor: 'error.main',
        }),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
