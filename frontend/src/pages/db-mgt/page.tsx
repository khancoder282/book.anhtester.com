import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  Box,
  Card,
  Grid,
  List,
  Link,
  Table,
  Stack,
  Alert,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  CardHeader,
  ListItemText,
  TableContainer,
  ListItemButton,
} from '@mui/material';

import { useRequest } from 'src/hooks/use-request';

import { axios } from 'src/api/axios';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import Title from 'src/components/title';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { NoData } from 'src/components/grid-view/components/not-data';

type DbColumn = {
  name: string;
  type: string;
  nullable: boolean;
  key: string;
  default: string | null;
  extra: string;
  references: string | null;
};

type DbTable = {
  name: string;
  rows: number;
  columns: DbColumn[];
};

const getSchema = () => axios.get('/db/schema').then((res) => res.data as DbTable[]);

const KEY_LABEL: Record<string, { text: string; color: 'primary' | 'info' | 'default' }> = {
  PRI: { text: 'PK', color: 'primary' },
  UNI: { text: 'UNIQUE', color: 'info' },
  MUL: { text: 'INDEX', color: 'default' },
};

const fNumber = (n: number) => new Intl.NumberFormat('vi-VN').format(n);
const plural = (n: number, word: string) => `${fNumber(n)} ${word}${n === 1 ? '' : 's'}`;

export default function Page() {
  const { data = [], loading, error, request } = useRequest(getSchema);
  const [params, setParams] = useSearchParams();

  const selected = useMemo(
    () => data.find((t) => t.name === params.get('table')) ?? data[0],
    [data, params]
  );
  const totalRows = useMemo(() => data.reduce((sum, t) => sum + t.rows, 0), [data]);

  const selectTable = (name: string) => setParams({ table: name }, { replace: true });

  return (
    <>
      <Title>Database Management - {CONFIG.appName}</Title>
      <DashboardContent>
        <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Stack sx={{ flexGrow: 1 }}>
            <Typography variant="h4">Database Management</Typography>
            <Typography variant="body2" color="text.secondary" id="db-summary">
              {data.length} tables · {fNumber(totalRows)} rows. Structure only, row data is not
              shown.
            </Typography>
          </Stack>
          <Button
            id="btn-reload-schema"
            color="inherit"
            variant="outlined"
            loading={loading}
            startIcon={<Iconify icon="solar:restart-bold" />}
            onClick={() => request()}
          >
            Reload
          </Button>
        </Box>

        {!!error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Cannot load database schema.{' '}
            {(error as any)?.response?.data?.msg ?? (error as Error)?.message}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <Card>
              <CardHeader title="Tables" sx={{ pb: 1 }} />
              <List id="db-table-list" sx={{ p: 1 }}>
                {data.map((t) => (
                  <ListItemButton
                    key={t.name}
                    selected={t.name === selected?.name}
                    onClick={() => selectTable(t.name)}
                    data-table={t.name}
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemText
                      primary={t.name}
                      secondary={plural(t.columns.length, 'column')}
                      slotProps={{ primary: { typography: 'subtitle2', noWrap: true } }}
                    />
                    <Label color={t.rows ? 'success' : 'default'}>{fNumber(t.rows)}</Label>
                  </ListItemButton>
                ))}
                {!loading && !error && data.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                    No table found.
                  </Typography>
                )}
              </List>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8, lg: 9 }}>
            <Card>
              {selected ? (
                <>
                  <CardHeader
                    id="db-table-title"
                    title={selected.name}
                    subheader={`${plural(selected.columns.length, 'column')} · ${plural(selected.rows, 'row')}`}
                  />
                  <TableContainer sx={{ mt: 2 }}>
                    <Table id="db-column-table" size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Column</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Nullable</TableCell>
                          <TableCell>Key</TableCell>
                          <TableCell>Default</TableCell>
                          <TableCell>References</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selected.columns.map((c) => (
                          <TableRow hover key={c.name} data-column={c.name}>
                            <TableCell>
                              <Typography variant="subtitle2">{c.name}</Typography>
                              {c.extra && (
                                <Typography variant="caption" color="text.secondary">
                                  {c.extra}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace' }}>{c.type}</TableCell>
                            <TableCell>{c.nullable ? 'Yes' : 'No'}</TableCell>
                            <TableCell>
                              {KEY_LABEL[c.key] && (
                                <Label color={KEY_LABEL[c.key].color}>
                                  {KEY_LABEL[c.key].text}
                                </Label>
                              )}
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                              {c.default ?? '—'}
                            </TableCell>
                            <TableCell>
                              {c.references ? (
                                <Link
                                  component="button"
                                  variant="body2"
                                  onClick={() => selectTable(c.references!.split('.')[0])}
                                  sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                                >
                                  <Iconify icon="solar:link-circle-line-duotone" width={16} />
                                  {c.references}
                                </Link>
                              ) : (
                                '—'
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Box sx={{ p: 3, height: 320 }}>
                  <NoData />
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </DashboardContent>
    </>
  );
}
