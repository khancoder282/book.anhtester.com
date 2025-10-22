import { TableRow, TableCell } from '@mui/material';

import { NoData } from './not-data';

export function TableRowNoTableView({ col, height }: { col: number; height: number }) {
  return (
    <TableRow className="no-data">
      <TableCell className="no-data" colSpan={col} height={height}>
        <NoData />
      </TableCell>
    </TableRow>
  );
}
