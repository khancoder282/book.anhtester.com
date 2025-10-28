import { useState, useEffect, useCallback } from 'react';

import { Box, Card, Stack, Button, MenuItem, Typography } from '@mui/material';

import { useDebounce } from 'src/hooks/use-debound';

import { axios } from 'src/api/axios';
import { useAuth } from 'src/store/auth';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { dialog } from 'src/components/dialog-confirm/confirm';
import { useTable } from 'src/components/grid-view/hook/use-table';
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
  const { auth } = useAuth();
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
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          User Management
        </Typography>
        {auth && (
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="solar:user-plus-bold" />}
            onClick={() => {
              formControl.reset({
                id: '',
              });
              dialog.custom(() => <AddUserDialog callback={loadUsers} />, { maxWidth: 'md' });
            }}
          >
            New user
          </Button>
        )}
      </Box>
      <Card>
        <TableFilterView
          placeholder="Search user (name, email, phone or address)"
          filter={fieldOptions}
          config={config}
        />
        <TableView
          filter={fieldOptions}
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
                      <MenuItem
                        disabled={row?.id === auth?.id}
                        onClick={() => {
                          formControl.reset({
                            ...row,
                            avatar: {
                              path: row.avatarUrl,
                            } as FileItem,
                          });
                          dialog.custom(() => <AddUserDialog callback={loadUsers} />, {
                            maxWidth: 'md',
                          });
                        }}
                      >
                        <Iconify icon="solar:pen-bold" />
                        Edit
                      </MenuItem>

                      <MenuItem
                        sx={{ color: 'error.main' }}
                        disabled={row?.id === auth?.id}
                        onClick={() =>
                          dialog.delete(
                            `Confirm you want to delete user "${row.name}".`,
                            async () => {
                              await handleDelete(row.id);
                              loadUsers();
                            }
                          )
                        }
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                        Delete
                      </MenuItem>
                    </Stack>
                  )
              : undefined
          }
        />
        <TablePaginationView
          rowsPerPageList={[5, 10, 15, 20, 25, 50, 100]}
          type="grid"
          total={total}
          config={config}
        />
      </Card>
    </DashboardContent>
  );
}
