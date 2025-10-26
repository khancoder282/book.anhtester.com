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
}: TableRowViewProps<T>) {
  const { setAnchorEl, setRow, setOpen } = usePopupAction();
  const isCheck = useMemo(
    () => select?.selected?.some((item) => item[keyName] === row[keyName]),
    [keyName, row, select?.selected]
  );
  
  const handleCheckbox = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (isCheck) {
        select?.setSelected?.(
          select.selected.filter((item) => JSON.stringify(item) !== JSON.stringify(row))
        );
      } else {
        select?.setSelected?.([...select.selected, row]);
      }
    },
    [isCheck, row, select]
  );
  return (
    <TableRow
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
          <Checkbox checked={isCheck} onClick={handleCheckbox} />
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
