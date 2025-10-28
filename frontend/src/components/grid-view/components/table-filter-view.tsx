import { useForm, useWatch, useFieldArray } from 'react-hook-form';
import React, { useRef, useState, useEffect, useDeferredValue } from 'react';

import {
  Box,
  Stack,
  Button,
  Collapse,
  IconButton,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { formControl } from '../store/form-control';
import { TableFilterItemView } from './table-filter-item-view';
import { checkFilter, RenderFilter } from '../utils/check-filter';

import type { UseTableReturn } from '../hook/use-table';

type TableFilterViewProps<T> = {
  config: UseTableReturn<T>;
  filter: FieldType<T>[];
  placeholder?: string;
};
export function TableFilterView<T>({
  config: { filter: filters, setFilter: setFilters },
  filter: fields,
  placeholder = 'Search...',
}: TableFilterViewProps<T>) {
  const [isFilter] = useWatch({
    control: formControl.control,
    name: ['_isFilter'],
  });
  const setIsFilter = (v: boolean) => formControl.setValue('_isFilter', v);

  const [search, setSearch] = useState('');
  const userChange = useRef<boolean>(false);
  const {
    control,
    reset,
    setValue,
    formState: { isValid },
  } = useForm<Fields>({
    formControl: formControl.formControl,
    defaultValues: {
      mode: 'AND',
      fields: [],
    },
    mode: 'all',
  });

  const {
    fields: fieldsControl,
    remove,
    append,
  } = useFieldArray({
    control,
    name: 'fields',
  });

  useEffect(() => {
    if (fieldsControl.length === 0) {
      setFilters('');
    }
  }, [fieldsControl.length, setFilters]);

  const _search = useDeferredValue(search);

  useEffect(() => {
    if (!isFilter) {
      setFilters((s) => {
        if (s !== _search) {
          return _search;
        }
        return s;
      });
    }
  }, [filters, _search, setFilters, isFilter]);

  const dataWatch = useWatch({ control }) as Fields;

  useEffect(() => {
    if (isValid && checkFilter(dataWatch) && isFilter) {
      const rsFilter = RenderFilter(dataWatch);

      setFilters((f) => {
        if (f !== rsFilter) {
          return rsFilter;
        }
        return f;
      });
    }
  }, [dataWatch, isFilter, isValid, setFilters]);

  return (
    <Scrollbar>
      <Stack p={3}>
        <Collapse in={!isFilter} mountOnEnter unmountOnExit>
          <Stack direction="row" spacing={1} alignItems="center">
            <OutlinedInput
              fullWidth
              placeholder={placeholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                userChange.current = true;
              }}
              startAdornment={
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" />
                </InputAdornment>
              }
            />
            <IconButton
              onClick={() => {
                if (fieldsControl.length === 0) {
                  reset({
                    mode: 'AND',
                    fields: [
                      {
                        key: fields[0].name as any,
                        value: '',
                        operator: 'equals',
                      },
                    ],
                  });
                }
                setIsFilter(true);
              }}
            >
              <Iconify icon="ic:round-filter-list" />
            </IconButton>
          </Stack>
        </Collapse>
        <Collapse in={isFilter} mountOnEnter unmountOnExit>
          <Stack spacing={2} minWidth={600}>
            {fieldsControl.map((field, index) => (
              <TableFilterItemView
                key={field.id}
                isOnly={fieldsControl.length === 1}
                control={control}
                index={index}
                fields={fields}
                setValue={setValue}
                remove={
                  fieldsControl.length === 1
                    ? () => {
                        setIsFilter(false);
                        setTimeout(() => {
                          formControl.setValue('fields', []);
                        }, 300);
                      }
                    : remove
                }
              />
            ))}
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                id="add-filter"
                color="inherit"
                startIcon={<Iconify icon="mingcute:add-line" />}
                variant="outlined"
                size="small"
                onClick={() =>
                  append({
                    key: fields[0].name as any,
                    value: '',
                    operator: 'equals',
                  })
                }
              >
                Add filter
              </Button>
              <Button
                id="clear-filter"
                color="error"
                onClick={() => {
                  setIsFilter(false);
                  setTimeout(() => {
                    formControl.setValue('fields', []);
                  }, 300);
                }}
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              >
                Clear filter
              </Button>
            </Box>
          </Stack>
        </Collapse>
      </Stack>
    </Scrollbar>
  );
}
