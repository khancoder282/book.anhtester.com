import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { varAlpha } from 'minimal-shared/utils';

import {
  Stack,
  TableRow,
  Checkbox,
  TableHead,
  TableCell,
  IconButton,
  TableSortLabel,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { formControl } from '../store/form-control';

import type { UseTableReturn } from '../hook/use-table';

const IconSort = ({ className }: { className?: string }) => (
  <Iconify className={className} icon="solar:sort-vertical-line-duotone" />
);

export function TableHeaderView<T>({
  columns,
  config,
  filter: filterList = [],
  isAction,
  isStickyAction = false,
  select,
  allRow,
  keyName
}: {
  columns: Columns<T>[];
  config: UseTableReturn<T>;
  filter?: FieldType<T>[];
  isAction: boolean;
  isStickyAction?: boolean;
  keyName: keyof T
  select?: {
    selected: T[];
    setSelected: (row: T[]) => void;
  };
  allRow: T[];
}) {
  const [filter] = useWatch({
    control: formControl.control,
    name: ['fields'],
  });
  const isSelectAll = useMemo(() => {
    if (!select?.selected?.length || !allRow?.length) return false;
    const selectedStrings = new Set(select.selected.map((r) => r[keyName]));
    return allRow.length > 0 && allRow.every((r) => selectedStrings.has(r[keyName]));
  }, [allRow, keyName, select?.selected]);

  const isSelect = useMemo(() => {
    if (!select?.selected?.length || !allRow?.length) return false;
    const selectedStrings = new Set(select.selected.map((r) => r[keyName]));
    return allRow.some((r) => selectedStrings.has(r[keyName]));
  }, [allRow, keyName, select?.selected]);

  const handleSelect = () => {
    if (!select) return;

    const selectedStrings = new Set(select.selected.map((r) => r[keyName]));

    if (isSelectAll) {
      select.setSelected(
        select.selected.filter(
          (r) => !allRow.some((rr) => rr[keyName] === r[keyName])
        )
      );
    } else {
      const newSelected = [
        ...select.selected,
        ...allRow.filter((r) => !selectedStrings.has(r[keyName])),
      ];
      select.setSelected(newSelected);
    }
  };

  const hanldeAddFilter = (c: Columns<T>) => () => {
    if (!formControl.getValues('_isFilter')) formControl.setValue('_isFilter', true);
    formControl.setValue('fields', [
      ...formControl.getValues('fields'),
      {
        key: c.sort as string,
        operator: 'equals',
        value: '',
      },
    ]);
  };

  return (
    <TableHead>
      <TableRow>
        {select && (
          <TableCell padding="checkbox">
            <Checkbox
              onClick={handleSelect}
              indeterminate={isSelect && !isSelectAll}
              checked={isSelectAll}
            />
          </TableCell>
        )}
        {columns.map((column, i) => (
          <TableCell key={i} sx={column.sx} component="th">
            {column.sort ? (
              <Stack direction="row">
                <TableSortLabel
                  sx={{ flex: 1 }}
                  IconComponent={IconSort}
                  active={config.order === column.sort}
                  direction={config.orderBy}
                  onClick={() => config.changeSort(column.sort!)}
                >
                  {column.label}
                </TableSortLabel>
                {filterList.some((f) => f.name === column.sort) && (
                  <IconButton
                    size="small"
                    sx={{
                      color: filter?.some((f) => f.key === column.sort)
                        ? 'secondary.main'
                        : (t) => varAlpha(t.palette.grey['500Channel'], 0.5),
                    }}
                    onClick={hanldeAddFilter(column)}
                  >
                    <Iconify width={16} icon="ic:round-filter-list" />
                  </IconButton>
                )}
              </Stack>
            ) : (
              column.label
            )}
          </TableCell>
        ))}
        {isAction && (
          <TableCell
            sx={
              isStickyAction
                ? {
                    position: 'sticky',
                    right: 0,
                  }
                : undefined
            }
          />
        )}
      </TableRow>
    </TableHead>
  );
}
