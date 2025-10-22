import type React from 'react';

import { useMemo, useState, useCallback } from 'react';

type useTableProps<T> = {
  order?: keyof T;
  orderBy?: 'asc' | 'desc';
  rowsPerPage?: number;
};

export type UseTableReturn<T> = {
  order: keyof T | undefined;
  orderBy: 'asc' | 'desc' | undefined;
  filter: string;
  page: number;
  rowsPerPage: number;
  changeSort: (property: keyof T) => void;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setRowsPerPage: React.Dispatch<React.SetStateAction<number>>;
};

export function useTable<T = any>({
  order: _order,
  orderBy: _orderBy,
  rowsPerPage: _rowsPerPage = 10,
}: useTableProps<T> = {}): UseTableReturn<T> {
  const [order, setOrder] = useState(_order);
  const [orderBy, setOrderBy] = useState(_orderBy);
  const [filter, _setFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(_rowsPerPage);

  const setFilter = useCallback((v: React.SetStateAction<string>) => {
    _setFilter(v);
    setPage(1);
  }, []);

  const changeSort = useCallback(
    (property: keyof T) => {
      if (!orderBy) {
        if (property) {
          setOrder(property);
          setOrderBy('asc');
        }
      } else {
        if (order === property) {
          if (orderBy === 'asc') {
            setOrderBy('desc');
          } else if (!_orderBy && !_order) {
            setOrder(undefined);
            setOrderBy(undefined);
          } else {
            setOrderBy('asc');
          }
        } else {
          setOrder(property);
          setOrderBy('asc');
        }
      }
    },
    [_order, _orderBy, order, orderBy, setOrder, setOrderBy]
  );
  
  return useMemo(
    () => ({
      order,
      orderBy,
      filter,
      page,
      rowsPerPage,
      changeSort,
      setFilter,
      setPage,
      setRowsPerPage,
    }),
    [order, orderBy, filter, page, rowsPerPage, changeSort, setFilter, setPage, setRowsPerPage]
  );
}
