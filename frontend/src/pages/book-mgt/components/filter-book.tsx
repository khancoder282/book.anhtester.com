import type { RowComponentProps } from 'react-window';

import { create } from 'zustand';
import { List as VirtualList } from 'react-window';
import React, { useState, useDeferredValue } from 'react';

import {
  Box,
  Tab,
  Tabs,
  Stack,
  Button,
  Dialog,
  Divider,
  Collapse,
  TextField,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  OutlinedInput,
  FormHelperText,
} from '@mui/material';

import { useRequest } from 'src/hooks/use-request';

import { useAuth } from 'src/store/auth';

import { Label } from 'src/components/label';
import { toast } from 'src/components/toast';
import { Iconify } from 'src/components/iconify';
import { SearchField } from 'src/components/fields/search-filed';
import { FromToField } from 'src/components/fields/from-to-field';
import { ButtonDelete } from 'src/components/buttons/button-delete';

import { BookSort } from './book-sort';
import { Category } from '../api/categorys';
import { mappingSort, type ReturnUseFileterBook } from '../stores/filter';

function formatNumber(from: number | null) {
  if (!from) return 'unset';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(from);
}

const priceOptions = [10_000, 100_000, 1_000_000, 10_000_000];
function getPriceLabel(price: { from?: number | null; to?: number | null }): string {
  const { from, to } = price;

  if (from != null && to != null)
    return `Price between ${formatNumber(from)} and ${formatNumber(to)}`;

  if (from != null) return `Price greater than or equal to ${formatNumber(from)}`;

  if (to != null) return `Price less than or equal to ${formatNumber(to)}`;

  return 'Price not specified';
}

export function FilterBook({ config }: { config: ReturnUseFileterBook }) {
  const {
    isFilter,
    setIsFilter,
    setSearchName,
    setCategory,
    setPrice,
    sort,
    setSort,
    searchName,
    price,
    category,
  } = config;

  const { auth } = useAuth();
  const { setId, id } = useEdit();
  const { data = [], request, setData } = useRequest(() => Category.get());
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const categories = useDeferredValue(data.filter((c) => c.name.includes(search)));

  return (
    <>
      <Box
        display="flex"
        justifyContent="end"
        mb={3}
        alignItems="center"
        gap={2}
        flexWrap="wrap-reverse"
      >
        <Button
          color="inherit"
          startIcon={<Iconify icon="ic:round-filter-list" />}
          endIcon={
            <Iconify
              icon={isFilter ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
            />
          }
          onClick={() => setIsFilter(!isFilter)}
        >
          Filter
        </Button>
        <BookSort
          options={Object.keys(mappingSort).map((item) => ({ value: item, label: item }))}
          sortBy={sort}
          onSort={(s) => setSort(s as any)}
        />
      </Box>

      <Collapse in={isFilter}>
        <Box
          ml="auto"
          mb={3}
          gap={2}
          width={1}
          sx={{
            display: 'flex',
            flexDirection: {
              xs: 'column',
              md: 'row-reverse',
            },
          }}
        >
          <Stack flex={1}>
            <SearchField
              color="inherit"
              value={searchName}
              onChange={setSearchName}
              placeholder="Search book..."
              sx={{ maxWidth: 'unset' }}
            />
          </Stack>
          <Stack flex={1}>
            <FromToField value={price} onChange={setPrice} options={priceOptions} />
            <FormHelperText sx={{ textAlign: 'right' }}>{getPriceLabel(price)}</FormHelperText>
          </Stack>
        </Box>
      </Collapse>

      <Stack direction="row" alignItems="center">
        <Tabs
          textColor="inherit"
          variant="scrollable"
          indicatorColor="primary"
          value={category}
          onChange={(_, value) => setCategory(value)}
        >
          <Tab value="" label="All" />
          {data
            .filter((c) => c.bookCount > 0)
            .map((item) => (
              <Tab
                key={item.name}
                value={item.name}
                label={
                  <Box display="flex" gap={0.5} alignItems="center">
                    {item.name} <Label>{item.bookCount}</Label>
                  </Box>
                }
              />
            ))}
        </Tabs>
        {auth && (
          <IconButton id="setting-category" onClick={() => setOpen(true)} sx={{ ml: 'auto' }}>
            <Iconify icon="solar:settings-bold-duotone" />
          </IconButton>
        )}
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Dialog open={open} fullWidth maxWidth="xs">
        <DialogTitle>
          Category management <Label>{data.length}</Label>
        </DialogTitle>
        <DialogContent dividers sx={{ borderStyle: 'dashed none' }}>
          <OutlinedInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (id) setId('');
            }}
            fullWidth
            placeholder="Add new category"
          />
          <Stack sx={{ height: 52 * 6, mt: 1 }}>
            {search && (
              <Box textAlign="center" mt={1}>
                <Button
                  onClick={() => {
                    toast.loading(() => Category.create(search), {
                      loading: 'Saving new category...',
                      success: async (res) => {
                        await request();
                        setSearch('');
                        return res.data.msg;
                      },
                      error: (err) => err.response.data.msg,
                    });
                  }}
                  color="inherit"
                >
                  Add &quot;{search}&quot; to list
                </Button>
              </Box>
            )}
            <VirtualList
              className="hidden-scrollbar"
              style={{ scrollSnapType: 'y mandatory' }}
              rowComponent={Row}
              rowCount={categories.length}
              rowHeight={52}
              rowProps={{ list: data, request, setData }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

const useEdit = create<{
  id: string;
  setId: (id: string) => void;
  newName: string;
  setNewName: (name: string) => void;
}>((set) => ({
  id: '',
  setId: (id: string) => set({ id, newName: id }),
  newName: '',
  setNewName: (name: string) => set({ newName: name }),
}));

const saveChange = (name: string, newName: string, success: () => void, error: () => void) =>
  toast.loading(() => Category.update(name, newName), {
    loading: 'Saving changes...',
    success: async (res) => {
      success();
      return res.data.msg;
    },
    error: (err) => {
      error();
      return err.response.data.msg;
    },
  });

const Row = ({
  list,
  setData,
  index,
  style,
  request,
}: RowComponentProps<{
  list: Categories[];
  setData: React.Dispatch<React.SetStateAction<Categories[] | undefined>>;
  request: () => Promise<void>;
}>) => {
  const { id, setId, newName, setNewName } = useEdit();
  const item = list[index];
  return (
    <Box
      key={item.name}
      style={style}
      sx={{ gap: 1, scrollSnapAlign: 'start', display: 'flex', alignItems: 'center' }}
    >
      {id !== item.name ? (
        <>
          <Typography pl={1.5} noWrap>
            {item.name}
          </Typography>
          <Label sx={{ mr: 'auto' }}>{item.bookCount}</Label>
        </>
      ) : (
        <TextField
          sx={{ flex: 1 }}
          size="small"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          name={`edit-${item.name}`}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              if (newName === item.name) {
                setId('');
                return;
              }
              setData((d) => d?.map((c) => (c.name === item.name ? { ...c, name: newName } : c)));
              saveChange(
                id,
                newName,
                () => setId(''),
                () => request()
              );
            }
          }}
          onBlur={() => {
            if (newName === item.name) {
              setId('');
              return;
            }
            setData((d) => d?.map((c) => (c.name === item.name ? { ...c, name: newName } : c)));
            saveChange(
              id,
              newName,
              () => setId(''),
              () => request()
            );
          }}
        />
      )}

      <Button
        id={`edit-${item.name}`}
        onClick={() => setId(id !== item.name ? item.name : '')}
        color="inherit"
        sx={{ minWidth: 'unset' }}
      >
        <Iconify icon={id !== item.name ? 'solar:pen-bold' : 'mingcute:close-line'} />
      </Button>
      <ButtonDelete
        id={`del-${item.name}`}
        onDelete={() =>
          toast.loading(() => Category.delete(item.name), {
            loading: 'Deleting category...',
            success: async (res) => {
              await request();
              return res.data.msg;
            },
            error: (err) => err.response.data.msg,
          })
        }
      />
    </Box>
  );
};
