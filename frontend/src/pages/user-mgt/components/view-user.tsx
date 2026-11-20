import { useState, useEffect, useCallback } from 'react';

import { Box, Card, Stack, Button, MenuItem, Typography } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useDebounce } from 'src/hooks/use-debound';

import { axios } from 'src/api/axios';
import { useAuth } from 'src/store/auth';
import { useTranslate } from 'src/locales';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { dialog } from 'src/components/dialog-confirm/confirm';
import { useTable } from 'src/components/grid-view/hook/use-table';
import { PageHeader } from 'src/components/page-header/page-header';
import { TableView } from 'src/components/grid-view/components/table-view';
import { TableFilterView } from 'src/components/grid-view/components/table-filter-view';
import { TablePaginationView } from 'src/components/grid-view/components/table-pagination-view';

import { formControl } from '../store/form';
import { handleDelete } from '../api/delete';
import { columns, fieldOptions } from '../columns';
import { AddUserDialog } from '../add-user-dialog';

export function ViewUser() {
  const config = useTable<User>({
    order: 'updatedAt',
    orderBy: 'desc',
    rowsPerPage: 5,
  });

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const { auth, setAuth } = useAuth();
  const router = useRouter();
  const { t } = useTranslate();
  const { orderBy, order, page, rowsPerPage, filter } = config;

  const search = useDebounce(filter, 650);

  const loadUsers = useCallback(
    () =>
      axios
        .get('/user', {
          params: {
            sortBy: orderBy,
            sort: order,
            page,
            limit: rowsPerPage,
            search,
          },
        })
        .then((res) => {
          setUsers(res.data.list);
          setTotal(res.data.pagination.total);
        }),
    [orderBy, order, page, rowsPerPage, search]
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <DashboardContent>
      <PageHeader
        icon="solar:users-group-rounded-bold"
        tone="blue"
        title={t('user.title')}
        subtitle={t('user.subtitle')}
        action={
          auth && (
            <Button
              data-testid="user-add"
              variant="contained"
              color="secondary"
              startIcon={<Iconify icon="solar:user-plus-bold" />}
              onClick={() => {
                formControl.reset({
                  id: '',
                });
                dialog.custom(() => <AddUserDialog callback={loadUsers} />, { maxWidth: 'md' });
              }}
            >
              {t('user.newUser')}
            </Button>
          )
        }
      />
      <Card>
        <TableFilterView
          testId="user"
          placeholder={t('user.searchPlaceholder')}
          filter={fieldOptions()}
          config={config}
        />
        <TableView
          testId="user"
          filter={fieldOptions()}
          sticky={{
            isStickyAction: true,
          }}
          columns={columns(auth, loadUsers)}
          data={users}
          config={config}
          sx={{
            '& tbody tr td': {
              borderBottomWidth: 1,
              borderBottomColor: 'divider',
              borderBottomStyle: 'dashed',
            },
          }}
          renderAction={
            auth
              ? (row) =>
                  row && (
                    <Stack>
                      {/* Mỗi user chỉ sửa / xoá được chính mình (API trả 403 với user khác) */}
                      <MenuItem
                        data-testid={`user-row-edit-${row.id}`}
                        disabled={row?.id !== auth?.id}
                        onClick={() => router.push('/user-management/my-profile')}
                      >
                        <Iconify icon="solar:pen-bold" />
                        {t('common.actions.edit')}
                      </MenuItem>

                      <MenuItem
                        data-testid={`user-row-delete-${row.id}`}
                        sx={{ color: 'error.main' }}
                        disabled={row?.id !== auth?.id}
                        onClick={() =>
                          dialog.delete(t('user.deleteConfirm', { name: row.name }), async () => {
                            const deleted = await handleDelete(row.id);
                            if (deleted && row.id === auth?.id) {
                              // Tự xoá tài khoản: phiên đã mất theo user, dọn phía client rồi về Sign in
                              localStorage.removeItem('accessToken');
                              setAuth(null);
                              router.push('/sign-in');
                              return;
                            }
                            loadUsers();
                          })
                        }
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                        {t('common.actions.delete')}
                      </MenuItem>
                    </Stack>
                  )
              : undefined
          }
        />
        <TablePaginationView
          testId="user"
          rowsPerPageList={[5, 10, 15, 20, 25, 50, 100]}
          type="grid"
          total={total}
          config={config}
        />
      </Card>
    </DashboardContent>
  );
}
