import { useCallback } from 'react';

import { Box, Card, Button, Typography } from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { useRequest } from 'src/hooks/use-request';
import { useDebounce } from 'src/hooks/use-debound';

import { useAuth } from 'src/store/auth';
import { useTranslate } from 'src/locales';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import Title from 'src/components/title';
import { Iconify } from 'src/components/iconify';
import { useTable } from 'src/components/grid-view/hook/use-table';
import { PageHeader } from 'src/components/page-header/page-header';
import { TableView } from 'src/components/grid-view/components/table-view';
import { TableFilterView } from 'src/components/grid-view/components/table-filter-view';
import { TablePaginationView } from 'src/components/grid-view/components/table-pagination-view';

import { getPromotion } from './api/get-promotion';
import { ActionList } from './components/action-list';
import { columns, getFields } from './hooks/columns-main';

export default function Page() {
  const { auth } = useAuth();
  const { t } = useTranslate();
  const fields = getFields();

  const config = useTable<PromotionType>({
    order: 'createdAt',
    orderBy: 'desc',
    rowsPerPage: 5,
  });

  const filter = useDebounce(config.filter, 500);

  const {
    data: { list, pagination: { total } } = {
      list: [],
      pagination: { total: 0 },
    },
    request,
  } = useRequest(
    useCallback(
      () =>
        getPromotion({
          limit: config.rowsPerPage,
          page: config.page,
          search: filter,
          sortBy: config.orderBy,
          sort: config.order,
        }),
      [config.order, config.orderBy, config.page, config.rowsPerPage, filter]
    )
  );

  return (
    <DashboardContent>
      <Title>{`${t('promotion.title')} - ${CONFIG.appName}`}</Title>
      <PageHeader
        icon="ph:seal-percent-fill"
        tone="orange"
        title={t('promotion.title')}
        subtitle={t('promotion.subtitle')}
        action={
          auth && (
            <Button
              data-testid="promotion-add"
              variant="contained"
              color="secondary"
              startIcon={<Iconify icon="mingcute:add-line" />}
              LinkComponent={RouterLink}
              href="/promotion-book-management/handle?name=create-new-promotion"
            >
              {t('promotion.newPromotion')}
            </Button>
          )
        }
      />
      <Card>
        <TableFilterView testId="promotion" config={config} filter={fields} />
        <TableView
          testId="promotion"
          config={config}
          columns={columns()}
          data={list}
          filter={fields}
          keyName="id"
          renderAction={
            auth ? (row) => row && <ActionList request={request} row={row} /> : undefined
          }
        />
        <TablePaginationView
          testId="promotion"
          total={total}
          config={config}
          rowsPerPageList={[5, 10, 15, 20, 25]}
        />
      </Card>
    </DashboardContent>
  );
}
