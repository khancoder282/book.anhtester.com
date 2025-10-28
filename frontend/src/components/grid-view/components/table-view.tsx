import {
  Table,
  Popover,
  TableRow,
  MenuList,
  TableBody,
  TableCell,
  TableContainer,
  menuItemClasses,
} from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';

import TableRowView from './table-row-view';
import { TableHeaderView } from './table-header-view';
import { usePopupAction } from '../store/use-popover';
import { TableRowNoTableView } from './table-row-no-data-view';

import type { UseTableReturn } from '../hook/use-table';

type GridViewTableProps<T> = {
  columns: Columns<T>[];
  config: UseTableReturn<T>;
  data: T[];
  action?: (row: T) => void;
  minWidth?: number;
  minRowHeight?: number;
  rowsPerPageList?: number[];
  renderAction?: ((row: T) => React.ReactNode) | false;
  sx?: Sx;
  onClickRow?: (row: T, index: number) => void;
  select?: {
    selected: T[];
    setSelected: (row: T[]) => void;
  };
  size?: 'small' | 'medium';
  keyName?: keyof T;
  sticky?: {
    isStickyAction?: boolean;
    isStickyHeader?: boolean;
  };
  filter?: FieldType<T>[];
};

export function TableView<T>({
  columns,
  data,
  config,
  minWidth = 800,
  minRowHeight,
  renderAction,
  sx,
  onClickRow,
  select,
  size = 'medium',
  keyName = 'id' as keyof T,
  sticky,
  filter = [],
}: GridViewTableProps<T>) {
  const { anchorEl, open, setOpen, row: dataRow } = usePopupAction();

  return (
    <>
      <Scrollbar>
        <TableContainer sx={{ overflow: 'unset', ...sx }}>
          <Table stickyHeader={sticky?.isStickyHeader} sx={{ minWidth }} size={size}>
            <TableHeaderView
              isAction={!!renderAction}
              filter={filter}
              columns={columns}
              config={config}
              select={select}
              allRow={data}
              keyName={keyName}
              isStickyAction={sticky?.isStickyAction}
            />
            <TableBody>
              {(data.length > 0 && (
                <>
                  {data.map((row, i) => (
                    <TableRowView
                      isAction={!!renderAction}
                      key={(keyName ? row[keyName] : i) as any}
                      row={row}
                      keyName={keyName}
                      columns={columns}
                      height={minRowHeight || size === 'small' ? 48 : 76}
                      onClickRow={() => onClickRow?.(row, i)}
                      select={select}
                      isStickyAction={sticky?.isStickyAction}
                    />
                  ))}
                  {data.length < config.rowsPerPage && (
                    <TableRow
                      sx={{
                        height:
                          (minRowHeight || size === 'small' ? 48 : 76) *
                          (config.rowsPerPage - data.length),
                      }}
                    >
                      <TableCell
                        colSpan={columns.length + (renderAction ? 1 : 0) + (select ? 1 : 0)}
                      />
                    </TableRow>
                  )}
                </>
              )) || (
                <TableRowNoTableView
                  col={columns.length + (renderAction ? 1 : 0) + (select ? 1 : 0)}
                  height={(minRowHeight || size === 'small' ? 48 : 76) * config.rowsPerPage}
                />
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
      {renderAction && (
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuList
            disablePadding
            onClick={() => setOpen(false)}
            sx={{
              p: 0.5,
              gap: 0.5,
              width: 140,
              display: 'flex',
              flexDirection: 'column',
              [`& .${menuItemClasses.root}`]: {
                px: 1,
                gap: 2,
                borderRadius: 0.75,
                [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
              },
            }}
          >
            {renderAction(dataRow as T)}
          </MenuList>
        </Popover>
      )}
    </>
  );
}
