import {
  Box,
  MenuItem,
  TextField,
  Pagination,
  useMediaQuery,
  TablePagination,
} from '@mui/material';

import { type TKey, useTranslate } from 'src/locales';

import type { UseTableReturn } from '../hook/use-table';

// Nhãn aria của nút chuyển trang (MUI mặc định: 'Go to <type> page')
const ARIA_KEYS: Record<string, TKey> = {
  first: 'components.table.goToFirst',
  last: 'components.table.goToLast',
  next: 'components.table.goToNext',
  previous: 'components.table.goToPrevious',
};

export function TablePaginationView<T>({
  config,
  total,
  rowsPerPageList,
  type = 'table',
  labelRowsPerPage,
}: {
  config: UseTableReturn<T>;
  total: number;
  rowsPerPageList?: number[];
  type?: 'table' | 'grid';
  labelRowsPerPage?: string;
}) {
  const { t } = useTranslate();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const ariaLabel = (item: string) => (ARIA_KEYS[item] ? t(ARIA_KEYS[item]) : `Go to ${item} page`);

  if (type === 'table') {
    return (
      <TablePagination
        component="div"
        size={isMobile ? 'small' : 'medium'}
        count={total}
        color="primary"
        page={config.page - 1}
        onPageChange={(_, page) => config.setPage(page + 1)}
        rowsPerPage={config.rowsPerPage}
        onRowsPerPageChange={(e) => config.setRowsPerPage(parseInt(e.target.value, 10))}
        labelRowsPerPage={labelRowsPerPage ?? t('components.table.rowsPerPage')}
        labelDisplayedRows={({ from, to, count }) =>
          t('components.table.displayedRows', {
            from,
            to,
            count: count !== -1 ? count : t('components.table.moreThan', { to }),
          })
        }
        getItemAriaLabel={ariaLabel}
        rowsPerPageOptions={rowsPerPageList}
      />
    );
  }

  return (
    <Box
      p={1}
      display="flex"
      alignItems="center"
      sx={{
        justifyContent: 'flex-end',
        flexWrap: 'wrap',
      }}
    >
      {rowsPerPageList && (
        <TextField
          select
          size="small"
          color="inherit"
          value={config.rowsPerPage}
          onChange={(e) => config.setRowsPerPage(Number(e.target.value))}
        >
          {rowsPerPageList.map((rowsPerPage) => (
            <MenuItem key={rowsPerPage} value={rowsPerPage}>
              {rowsPerPage}
            </MenuItem>
          ))}
        </TextField>
      )}
      <Pagination
        size={isMobile ? 'small' : 'medium'}
        color="primary"
        page={config.page}
        count={Math.ceil(total / config.rowsPerPage)}
        onChange={(_, page) => config.setPage(page)}
        getItemAriaLabel={(item, page, selected) => {
          if (item !== 'page') return ariaLabel(item);
          return selected
            ? t('components.table.page', { page: page ?? '' })
            : t('components.table.goToPage', { page: page ?? '' });
        }}
        sx={{ '& ul': { flexWrap: 'nowrap' } }}
      />
    </Box>
  );
}
