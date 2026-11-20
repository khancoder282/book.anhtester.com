import { useMemo, useState } from 'react';

import {
  Box,
  Card,
  Link,
  Table,
  Stack,
  Button,
  Switch,
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

import { RouterLink } from 'src/routes/components';

import { useRequest } from 'src/hooks/use-request';

import { useAuth } from 'src/store/auth';
import { useTranslate } from 'src/locales';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import Title from 'src/components/title';
import { Label } from 'src/components/label';
import { toast } from 'src/components/toast';
import { Iconify } from 'src/components/iconify';
import { dialog } from 'src/components/dialog-confirm/confirm';
import { PageHeader } from 'src/components/page-header/page-header';
import { NoData } from 'src/components/grid-view/components/not-data';
import { searchInputProps } from 'src/components/fields/search-input-props';

import { Category } from '../book-mgt/api/categorys';

// Cùng giới hạn với ô Category trong form sách (card-property.tsx)
const MAX_LENGTH = 24;

type SortKey = 'name' | 'isActive' | 'bookCount';

/** Trang Book lọc theo category qua query `category` (xem book-mgt/stores/filter.ts) */
const bookLink = (name: string) => `/book-management?category=${encodeURIComponent(name)}`;

export default function CategoryMgt() {
  const { auth } = useAuth();
  const { t, lang } = useTranslate();
  // Message lỗi từ backend giữ nguyên (tiếng Anh), chỉ dịch câu dự phòng
  const errorMsg = (err: any) => err?.response?.data?.msg ?? t('common.somethingWrong');
  const { data = [], loading, request, setData } = useRequest(Category.get);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'name',
    dir: 'asc',
  });

  const rows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const filtered = keyword ? data.filter((c) => c.name.toLowerCase().includes(keyword)) : data;
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sort.key === 'name') return a.name.localeCompare(b.name, lang) * factor;
      if (sort.key === 'isActive') return (Number(a.isActive) - Number(b.isActive)) * factor;
      return (a.bookCount - b.bookCount) * factor;
    });
  }, [data, search, sort, lang]);

  const totalBooks = useMemo(() => data.reduce((sum, c) => sum + c.bookCount, 0), [data]);
  // Đang tìm thì số liệu theo kết quả lọc, kèm tổng để so
  const shownBooks = useMemo(() => rows.reduce((sum, c) => sum + c.bookCount, 0), [rows]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));

  const nameRules = (current?: string) => ({
    required: t('category.validation.required'),
    maxLength: {
      value: MAX_LENGTH,
      message: t('category.validation.maxLength', { max: MAX_LENGTH }),
    },
    validate: {
      notBlank: (val: string) => val.trim().length > 0 || t('category.validation.required'),
      noSlash: (val: string) => !val.includes('/') || t('category.validation.noSlash'),
      noChange: (val: string) => val.trim() !== current || t('category.validation.noChange'),
      unique: (val: string) =>
        !data.some(
          (c) => c.name !== current && c.name.toLowerCase() === val.trim().toLowerCase()
        ) || t('category.validation.exists'),
    },
  });

  const openCreate = () =>
    dialog.form({
      title: t('category.newCategory'),
      body: {
        name: {
          type: 'text',
          label: t('category.form.name'),
          defaultValue: '',
          rules: nameRules(),
          props: { autoFocus: true, inputProps: { id: 'category-name' } },
        },
      },
      action: {
        children: t('common.actions.create'),
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
      title: t('category.form.renameTitle', { name: row.name }),
      body: {
        name: {
          type: 'text',
          label: t('category.form.newName'),
          defaultValue: row.name,
          rules: nameRules(row.name),
          props: { autoFocus: true, inputProps: { id: 'category-new-name' } },
        },
      },
      action: {
        children: t('common.actions.save'),
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

  const toggleStatus = (row: Categories) => {
    const isActive = !row.isActive;
    // Đổi ngay trên UI, lỗi thì tải lại danh sách để về trạng thái thật
    setData((list) => list?.map((c) => (c.name === row.name ? { ...c, isActive } : c)));
    Category.setStatus(row.name, isActive)
      .then(() =>
        toast.success(
          t('category.statusChanged', {
            name: row.name,
            status: t(isActive ? 'category.status.active' : 'category.status.inactive'),
          })
        )
      )
      .catch((err) => {
        toast.error(errorMsg(err));
        request();
      });
  };

  const openDelete = (row: Categories) =>
    dialog.delete(
      <>
        {t('category.deleteConfirm', { name: row.name })}
        {row.bookCount > 0 && (
          <>
            <br />
            {t('category.deleteWarning', { count: row.bookCount })}
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
      <Title>
        {t('category.title')} - {CONFIG.appName}
      </Title>
      <DashboardContent>
        <PageHeader
          icon="solar:widget-4-bold-duotone"
          tone="purple"
          title={t('category.title')}
          subtitle={t('category.subtitle')}
          action={
            auth && (
              <Button
                id="btn-new-category"
                variant="contained"
                color="secondary"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={openCreate}
              >
                {t('category.newCategory')}
              </Button>
            )
          }
        />

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
              placeholder={t('category.searchPlaceholder')}
              sx={{ width: { xs: 1, sm: 320 } }}
              slotProps={{
                htmlInput: { ...searchInputProps, id: 'search-category' },
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
              {search.trim()
                ? t('category.summaryFiltered', {
                    shown: rows.length,
                    count: data.length,
                    links: shownBooks,
                    totalLinks: totalBooks,
                  })
                : t('category.summary', { count: data.length, links: totalBooks })}
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
                      {t('category.columns.name')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell width={160}>
                    <Tooltip title={t('category.statusHint')}>
                      <TableSortLabel
                        active={sort.key === 'isActive'}
                        direction={sort.key === 'isActive' ? sort.dir : 'asc'}
                        onClick={() => toggleSort('isActive')}
                      >
                        {t('category.columns.status')}
                      </TableSortLabel>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right" width={160}>
                    <TableSortLabel
                      active={sort.key === 'bookCount'}
                      direction={sort.key === 'bookCount' ? sort.dir : 'asc'}
                      onClick={() => toggleSort('bookCount')}
                    >
                      {t('category.columns.books')}
                    </TableSortLabel>
                  </TableCell>
                  {auth && <TableCell align="right" width={120} />}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    hover
                    key={row.name}
                    data-category={row.name}
                    data-active={row.isActive}
                  >
                    <TableCell>
                      <Typography
                        variant="subtitle2"
                        color={row.isActive ? 'text.primary' : 'text.disabled'}
                      >
                        {row.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {auth ? (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Switch
                            checked={row.isActive}
                            onChange={() => toggleStatus(row)}
                            slotProps={{
                              input: {
                                id: `status-${row.name}`,
                                role: 'switch',
                                'aria-label': t('category.statusToggle', { name: row.name }),
                              },
                            }}
                          />
                          <Typography
                            variant="body2"
                            color={row.isActive ? 'success.main' : 'text.disabled'}
                          >
                            {t(
                              row.isActive ? 'category.status.active' : 'category.status.inactive'
                            )}
                          </Typography>
                        </Stack>
                      ) : (
                        <Label color={row.isActive ? 'success' : 'default'}>
                          {t(row.isActive ? 'category.status.active' : 'category.status.inactive')}
                        </Label>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip
                        title={t('category.viewBooks', { count: row.bookCount, name: row.name })}
                      >
                        <Link
                          component={RouterLink}
                          href={bookLink(row.name)}
                          data-action="view-books"
                          aria-label={t('category.viewBooks', {
                            count: row.bookCount,
                            name: row.name,
                          })}
                          underline="none"
                          sx={{
                            display: 'inline-flex',
                            borderRadius: 0.75,
                            '&:hover > span, &:focus-visible > span': {
                              boxShadow: (theme) => `0 0 0 2px ${theme.vars.palette.info.main}`,
                            },
                          }}
                        >
                          <Label
                            color={row.bookCount ? 'info' : 'default'}
                            sx={{ cursor: 'pointer' }}
                          >
                            {row.bookCount}
                          </Label>
                        </Link>
                      </Tooltip>
                    </TableCell>
                    {auth && (
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Tooltip title={t('common.actions.rename')}>
                          <IconButton
                            data-action="rename"
                            aria-label={`${t('common.actions.rename')} ${row.name}`}
                            onClick={() => openRename(row)}
                          >
                            <Iconify icon="solar:pen-bold" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.actions.delete')}>
                          <IconButton
                            data-action="delete"
                            aria-label={`${t('common.actions.delete')} ${row.name}`}
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
                    <TableCell colSpan={auth ? 4 : 3} sx={{ py: 3 }}>
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
