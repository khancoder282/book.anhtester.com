import { Stack, MenuItem } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { dialog } from 'src/components/dialog-confirm/confirm';

import { deletePromotion } from '../api/delete-promotion';

export function ActionList({ row, request }: { row: PromotionType; request: () => Promise<void> }) {
  const { t } = useTranslate();
  const router = useRouter();

  return (
    <Stack>
      <MenuItem onClick={() => router.push(`/promotion-book-management/handle?id=${row.id}`)}>
        <Iconify icon="solar:pen-bold" />
        {t('common.actions.edit')}
      </MenuItem>

      <MenuItem
        sx={{ color: 'error.main' }}
        onClick={() =>
          dialog.delete(t('promotion.confirmDelete', { name: row.name }), async () => {
            if (await deletePromotion(row.id)) await request();
          })
        }
      >
        <Iconify icon="solar:trash-bin-trash-bold" />
        {t('common.actions.delete')}
      </MenuItem>
    </Stack>
  );
}
