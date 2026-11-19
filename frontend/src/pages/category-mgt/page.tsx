import { useMemo, useState } from 'react';

import {
  Box,
  Card,
  Table,
  Stack,
  Button,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  TableContainer,
  TableSortLabel,
} from '@mui/material';

import { useRequest } from 'src/hooks/use-request';

import { useAuth } from 'src/store/auth';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import Title from 'src/components/title';
import { Label } from 'src/components/label';
import { toast } from 'src/components/toast';
import { Iconify } from 'src/components/iconify';
import { dialog } from 'src/components/dialog-confirm/confirm';
import { NoData } from 'src/components/grid-view/components/not-data';

import { Category } from '../book-mgt/api/categorys';

// Cùng giới hạn với ô Category trong form sách (card-property.tsx)
const MAX_LENGTH = 24;

type SortKey = 'name' | 'bookCount';

const errorMsg = (err: any) => err?.response?.data?.msg ?? 'Something went wrong.';

export default function CategoryMgt() {
  const { auth } = useAuth();
  const { data = [], loading, request } = useRequest(Category.get);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'name',
    dir: 'asc',
  });

  const rows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const filtered = keyword ? data.filter((c) => c.name.toLowerCase().includes(keyword)) : data;
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) =>
      sort.key === 'name'
        ? a.name.localeCompare(b.name, 'vi') * factor
        : (a.bookCount - b.bookCount) * factor
    );
  }, [data, search, sort]);

  const totalBooks = useMemo(() => data.reduce((sum, c) => sum + c.bookCount, 0), [data]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));

  const nameRules = (current?: string) => ({
    required: 'Category name is required',
    maxLength: { value: MAX_LENGTH, message: `Maximum ${MAX_LENGTH} characters` },
    validate: {
      notBlank: (val: string) => val.trim().length > 0 || 'Category name is required',
      noSlash: (val: string) => !val.includes('/') || 'Category name cannot contain "/"',
      noChange: (val: string) => val.trim() !== current || 'New name must be different',
      unique: (val: string) =>
        !data.some(
          (c) => c.name !== current && c.name.toLowerCase() === val.trim().toLowerCase()
        ) || 'Category already exists',
    },
  });

  const openCreate = () =>
    dialog.form({
      title: 'New category',
      body: {
        name: {
          type: 'text',
          label: 'Category name',
          defaultValue: '',
          rules: nameRules(),
          props: { autoFocus: true, inputProps: { id: 'category-name' } },
        },
      },
      action: {
        children: 'Create',
        startIcon: <Iconify icon="mingcute:add-line" />,
        onAction: (d) =>
          Category.create(d.name.trim())
            .then((res) => {
              toast.success(res.data.msg);
              request();
            })
            .catch((err) => {
              toast.error(errorMsg(err));
              throw err;
            }),
      },
    });

  const openRename = (row: Categories) =>
    dialog.form({
      title: `Rename category "${row.name}"`,
      body: {
        name: {
          type: 'text',
          label: 'New name',
          defaultValue: row.name,
          rules: nameRules(row.name),
          props: { autoFocus: true, inputProps: { id: 'category-new-name' } },
        },
      },
      action: {
        children: 'Save',
        startIcon: <Iconify icon="solar:pen-bold" />,
        onAction: (d) =>
          Category.update(row.name, d.name.trim())
            .then((res) => {
              toast.success(res.data.msg);
              request();
            })
            .catch((err) => {
              toast.error(errorMsg(err));
              throw err;
            }),
      },
    });

  const openDelete = (row: Categories) =>
    dialog.delete(
      <>
        Confirm you want to delete category <b>&quot;{row.name}&quot;</b>.
        {row.bookCount > 0 && (
          <>
            <br />
            {row.bookCount} book(s) will no longer belong to this category. The books themselves are
            not deleted.
          </>
        )}
      </>,
      () =>
        Category.delete(row.name)
          .then((res) => {
            toast.success(res.data.msg);
            request();
          })
          .catch((err) => {
            toast.error(errorMsg(err));
          })
    );

  return (
    <>
      <Title>Category Management - {CONFIG.appName}</Title>
      <DashboardContent>
        <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            Category Management
          </Typography>
          {auth && (
            <Button
              id="btn-new-category"
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={openCreate}
            >
              New category
            </Button>
          )}
        </Box>

        <Card>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ sm: 'center' }}
            sx={{ p: 2.5 }}
          >
            <TextField
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category..."
              sx={{ width: { xs: 1, sm: 320 } }}
              slotProps={{
                htmlInput: { id: 'search-category' },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Box flexGrow={1} />
            <Typography variant="body2" color="text.secondary" id="category-summary">
              {data.length} categories · {totalBooks} book links
            </Typography>
          </Stack>

          <TableContainer>
            <Table id="table-category">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sort.key === 'name'}
                      direction={sort.key === 'name' ? sort.dir : 'asc'}
                      onClick={() => toggleSort('name')}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" width={160}>
                    <TableSortLabel
                      active={sort.key === 'bookCount'}
                      direction={sort.key === 'bookCount' ? sort.dir : 'asc'}
                      onClick={() => toggleSort('bookCount')}
                    >
                      Books
                    </TableSortLabel>
                  </TableCell>
                  {auth && <TableCell align="right" width={120} />}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow hover key={row.name} data-category={row.name}>
                    <TableCell>
                      <Typography variant="subtitle2">{row.name}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Label color={row.bookCount ? 'info' : 'default'}>{row.bookCount}</Label>
                    </TableCell>
                    {auth && (
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Tooltip title="Rename">
                          <IconButton
                            aria-label={`Rename ${row.name}`}
                            onClick={() => openRename(row)}
                          >
                            <Iconify icon="solar:pen-bold" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            aria-label={`Delete ${row.name}`}
                            color="error"
                            onClick={() => openDelete(row)}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {!loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={auth ? 3 : 2} sx={{ py: 3 }}>
                      <NoData sx={{ py: 3 }} />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </DashboardContent>
    </>
  );
}
