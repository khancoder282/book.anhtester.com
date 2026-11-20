import {
  Box,
  MenuItem,
  TextField,
  Pagination,
  useMediaQuery,
  PaginationItem,
  TablePagination,
} from '@mui/material';

import { useKeepInView } from 'src/hooks/use-keep-in-view';

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
  testId = 'table',
}: {
  config: UseTableReturn<T>;
  total: number;
  rowsPerPageList?: number[];
  type?: 'table' | 'grid';
  labelRowsPerPage?: string;
  /** Tiền tố data-testid (mặc định 'table') */
  testId?: string;
}) {
  const tid = `${testId}-pagination`;
  const { t } = useTranslate();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  // Chuyển trang / đổi số dòng: giữ thanh phân trang đứng yên, không để trang bị đẩy lên đầu (2026-11-21)
  const { ref, keep } = useKeepInView<HTMLDivElement>();
  const ariaLabel = (item: string) => (ARIA_KEYS[item] ? t(ARIA_KEYS[item]) : `Go to ${item} page`);

  if (type === 'table') {
    return (
      <TablePagination
        ref={ref}
        data-testid={tid}
        component="div"
        size={isMobile ? 'small' : 'medium'}
        count={total}
        color="primary"
        page={config.page - 1}
        onPageChange={(_, page) => {
          keep();
          config.setPage(page + 1);
        }}
        rowsPerPage={config.rowsPerPage}
        onRowsPerPageChange={(e) => {
          keep();
          config.setRowsPerPage(parseInt(e.target.value, 10));
        }}
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
        slotProps={{
          select: { SelectDisplayProps: { 'data-testid': `${tid}-rows-per-page` } as object },
          actions: {
            firstButton: { 'data-testid': `${tid}-first` } as object,
            previousButton: { 'data-testid': `${tid}-previous` } as object,
            nextButton: { 'data-testid': `${tid}-next` } as object,
            lastButton: { 'data-testid': `${tid}-last` } as object,
          },
        }}
      />
    );
  }

  return (
    <Box
      ref={ref}
      data-testid={tid}
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
          slotProps={{
            select: { SelectDisplayProps: { 'data-testid': `${tid}-rows-per-page` } as object },
          }}
          value={config.rowsPerPage}
          onChange={(e) => {
            keep();
            config.setRowsPerPage(Number(e.target.value));
          }}
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
        onChange={(_, page) => {
          keep();
          config.setPage(page);
        }}
        getItemAriaLabel={(item, page, selected) => {
          if (item !== 'page') return ariaLabel(item);
          return selected
            ? t('components.table.page', { page: page ?? '' })
            : t('components.table.goToPage', { page: page ?? '' });
        }}
        renderItem={(item) => (
          <PaginationItem
            {...item}
            data-testid={item.type === 'page' ? `${tid}-page-${item.page}` : `${tid}-${item.type}`}
          />
        )}
        sx={{ '& ul': { flexWrap: 'nowrap' } }}
      />
    </Box>
  );
}
