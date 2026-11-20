import { useMemo, useCallback } from 'react';

import { TableRow, Checkbox, TableCell, IconButton } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { usePopupAction } from '../store/use-popover';

type TableRowViewProps<T> = {
  columns: Columns<T>[];
  row: T;
  height: number;
  isAction: boolean;
  onClickRow?: () => void;
  select?: {
    selected: T[];
    setSelected: (row: T[]) => void;
  };
  isStickyAction?: boolean;
  keyName: keyof T;
  testId?: string;
};

export default function TableRowView<T>({
  row,
  columns,
  height,
  isAction,
  onClickRow,
  select,
  isStickyAction = false,
  keyName,
  testId = 'table',
}: TableRowViewProps<T>) {
  const rowKey = String(row[keyName]);
  const { setAnchorEl, setRow, setOpen } = usePopupAction();
  const isCheck = useMemo(
    () => select?.selected?.some((item) => item[keyName] === row[keyName]),
    [keyName, row, select?.selected]
  );

  const handleCheckbox = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (isCheck) {
        select?.setSelected?.(select.selected.filter((item) => item[keyName] !== row[keyName]));
      } else {
        select?.setSelected?.([...select.selected, row]);
      }
    },
    [isCheck, keyName, row, select]
  );
  return (
    <TableRow
      data-testid={`${testId}-row-${rowKey}`}
      sx={{
        height,
        cursor: 'pointer',
        transition: 'all 0.1s ease-in-out',
        ...(!!onClickRow && { '&:hover > *': { bgcolor: 'background.neutral' } }),
      }}
      onClick={onClickRow}
      selected={isCheck}
    >
      {select && (
        <TableCell padding="checkbox">
          <Checkbox
            checked={isCheck}
            onClick={handleCheckbox}
            slotProps={{ input: { 'data-testid': `${testId}-row-select-${rowKey}` } as object }}
          />
        </TableCell>
      )}
      {columns.map((column, i) => (
        <TableCell sx={column.sx} key={i}>
          {column.render(row)}
        </TableCell>
      ))}
      {isAction && (
        <TableCell
          align="right"
          sx={
            isStickyAction
              ? {
                  position: 'sticky',
                  right: 0,
                  bgcolor: 'background.paper',
                  px: 1.5,
                }
              : {}
          }
        >
          <IconButton
            data-testid={`${testId}-row-menu-${rowKey}`}
            onClick={(e) => {
              setAnchorEl(e.currentTarget);
              setRow(row);
              setOpen(true);
              e.stopPropagation();
            }}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      )}
    </TableRow>
  );
}
