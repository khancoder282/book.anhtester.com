import { TableRow, TableCell } from '@mui/material';

import { NoData } from './not-data';

export function TableRowNoTableView({
  col,
  height,
  testId = 'table',
}: {
  col: number;
  height: number;
  testId?: string;
}) {
  return (
    <TableRow className="no-data">
      <TableCell className="no-data" colSpan={col} height={height}>
        <NoData testId={`${testId}-no-data`} />
      </TableCell>
    </TableRow>
  );
}
