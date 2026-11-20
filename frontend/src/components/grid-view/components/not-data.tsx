import { varAlpha } from 'minimal-shared/utils';

import { Box, Typography } from '@mui/material';

import { useTranslate } from 'src/locales';

export function NoData({ sx, testId = 'no-data' }: { sx?: Sx; testId?: string }) {
  const { t } = useTranslate();

  return (
    <Box
      data-testid={testId}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 1,
        boxSizing: 'content-box',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.04),
        border: 1,
        borderRadius: 2,
        borderColor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.08),
        borderStyle: 'dashed',
        ...sx,
      }}
    >
      <Box
        component="img"
        loading="lazy"
        sx={{
          width: 150,
          height: 150,
        }}
        src="/assets/ic-content.svg"
      />
      <Typography variant="h6" color="textDisabled">
        {t('common.noData')}
      </Typography>
    </Box>
  );
}
