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
import { useTranslate } from 'src/locales';
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

export default function Page() {
  const { data = [], loading, error, request } = useRequest(getSchema);
  const [params, setParams] = useSearchParams();
  const { t } = useTranslate();
  const columnCount = (n: number) =>
    n === 1 ? t('db.columnCountOne') : t('db.columnCount', { count: fNumber(n) });
  const rowCount = (n: number) =>
    n === 1 ? t('db.rowCountOne') : t('db.rowCount', { count: fNumber(n) });

  const selected = useMemo(
    () => data.find((tb) => tb.name === params.get('table')) ?? data[0],
    [data, params]
  );
  const totalRows = useMemo(() => data.reduce((sum, tb) => sum + tb.rows, 0), [data]);

  const selectTable = (name: string) => setParams({ table: name }, { replace: true });

  return (
    <>
      <Title>
        {t('db.title')} - {CONFIG.appName}
      </Title>
      <DashboardContent>
        <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Stack sx={{ flexGrow: 1 }}>
            <Typography variant="h4">{t('db.title')}</Typography>
            <Typography variant="body2" color="text.secondary" id="db-summary">
              {t('db.summary', { tables: data.length, rows: fNumber(totalRows) })}
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
            {t('common.actions.reload')}
          </Button>
        </Box>

        {!!error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {t('db.loadError')} {(error as any)?.response?.data?.msg ?? (error as Error)?.message}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <Card>
              <CardHeader title={t('db.tables')} sx={{ pb: 1 }} />
              <List id="db-table-list" sx={{ p: 1 }}>
                {data.map((tb) => (
                  <ListItemButton
                    key={tb.name}
                    selected={tb.name === selected?.name}
                    onClick={() => selectTable(tb.name)}
                    data-table={tb.name}
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemText
                      primary={tb.name}
                      secondary={columnCount(tb.columns.length)}
                      slotProps={{ primary: { typography: 'subtitle2', noWrap: true } }}
                    />
                    <Label color={tb.rows ? 'success' : 'default'}>{fNumber(tb.rows)}</Label>
                  </ListItemButton>
                ))}
                {!loading && !error && data.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                    {t('db.noTable')}
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
                    subheader={`${columnCount(selected.columns.length)} · ${rowCount(selected.rows)}`}
                  />
                  <TableContainer sx={{ mt: 2 }}>
                    <Table id="db-column-table" size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('db.columns.column')}</TableCell>
                          <TableCell>{t('db.columns.type')}</TableCell>
                          <TableCell>{t('db.columns.nullable')}</TableCell>
                          <TableCell>{t('db.columns.key')}</TableCell>
                          <TableCell>{t('db.columns.default')}</TableCell>
                          <TableCell>{t('db.columns.references')}</TableCell>
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
                            <TableCell>
                              {c.nullable ? t('common.status.yes') : t('common.status.no')}
                            </TableCell>
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
