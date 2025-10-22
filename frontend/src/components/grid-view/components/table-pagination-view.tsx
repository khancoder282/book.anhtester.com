import {
  Box,
  MenuItem,
  TextField,
  Pagination,
  useMediaQuery,
  TablePagination,
} from '@mui/material';

import type { UseTableReturn } from '../hook/use-table';

export function TablePaginationView<T>({
  config,
  total,
  rowsPerPageList,
  type = 'table',
  labelRowsPerPage
}: {
  config: UseTableReturn<T>;
  total: number;
  rowsPerPageList?: number[];
  type?: 'table' | 'grid';
  labelRowsPerPage?: string;
}) {
  const isMobile = useMediaQuery((t) => t.breakpoints.down('sm'));

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
        labelRowsPerPage={labelRowsPerPage}
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
      {rowsPerPageList && <TextField
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
      </TextField>}
      <Pagination
        size={isMobile ? 'small' : 'medium'}
        color="primary"
        page={config.page}
        count={Math.ceil(total / config.rowsPerPage)}
        onChange={(_, page) => config.setPage(page)}
        sx={{ '& ul': { flexWrap: 'nowrap' } }}
      />
    </Box>
  );
}
